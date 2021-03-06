import { EventEmitter, OnInit, AfterViewInit, OnDestroy, QueryList, TemplateRef } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Subscription } from "rxjs/Subscription";
import { DynamicFormControlModel } from "../model/dynamic-form-control.model";
import { DynamicFormValueControlModel, DynamicFormControlValue } from "../model/dynamic-form-value-control.model";
import { DynamicFormControlRelationGroup } from "../model/dynamic-form-control-relation.model";
import { DynamicFormArrayGroupModel } from "../model/form-array/dynamic-form-array.model";
import {
    DynamicInputModel,
    DYNAMIC_FORM_CONTROL_TYPE_INPUT,
    DYNAMIC_FORM_CONTROL_INPUT_TYPE_FILE
} from "../model/input/dynamic-input.model";
import {
    DynamicTemplateDirective,
    DYNAMIC_TEMPLATE_DIRECTIVE_ALIGN_END,
    DYNAMIC_TEMPLATE_DIRECTIVE_ALIGN_START
} from "../directive/dynamic-template.directive";
import { isDefined } from "../utils";
import * as relationUtils from "./dynamic-form-control-relation.utils";

export interface DynamicFormControlEvent {

    $event: Event | FocusEvent | DynamicFormControlEvent | any;
    context: DynamicFormArrayGroupModel | null;
    control: FormControl;
    group: FormGroup;
    model: DynamicFormControlModel;
}

export abstract class DynamicFormControlComponent implements OnInit, AfterViewInit, OnDestroy {

    bindId: boolean;
    context: DynamicFormArrayGroupModel | null;
    control: FormControl;
    group: FormGroup;
    hasErrorMessaging: boolean = false;
    hasFocus: boolean;
    model: DynamicFormControlModel;
    nestedTemplates: QueryList<DynamicTemplateDirective>;
    template: TemplateRef<any>;
    templateDirective: DynamicTemplateDirective;
    templates: QueryList<DynamicTemplateDirective>;

    blur: EventEmitter<DynamicFormControlEvent>;
    change: EventEmitter<DynamicFormControlEvent>;
    filter: EventEmitter<DynamicFormControlEvent>;
    focus: EventEmitter<DynamicFormControlEvent>;

    private subscriptions: Subscription[] = [];

    abstract type: string | null;

    constructor() {}

    ngOnInit(): void {

        if (!isDefined(this.model) || !isDefined(this.group)) {
            throw new Error(`no [model] or [group] input binding defined for DynamicFormControlComponent`);
        }

        this.control = this.group.get(this.model.id) as FormControl;

        this.subscriptions.push(this.control.valueChanges.subscribe(this.onControlValueChanges.bind(this)));
        this.subscriptions.push(this.model.disabledUpdates.subscribe(this.onModelDisabledUpdates.bind(this)));

        if (this.model instanceof DynamicFormValueControlModel) {

            let model = this.model as DynamicFormValueControlModel<DynamicFormControlValue>;

            this.subscriptions.push(model.valueUpdates.subscribe(this.onModelValueUpdates.bind(this)));
        }

        if (this.model.relation.length > 0) {
            this.setControlRelations();
        }
    }

    ngAfterViewInit(): void {
        setTimeout(() => this.setTemplates(), 0); // setTimeout to trigger change detection
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    get errorMessages(): string[] {

        let model = this.model as DynamicFormValueControlModel<DynamicFormControlValue>,
            messages = [];

        if (isDefined(model.errorMessages)) {

            for (let validatorName in this.control.errors) {

                let message;

                if (validatorName === "minlength" || validatorName === "maxlength") {
                    validatorName = validatorName.replace("length", "Length");
                }

                if (model.errorMessages[validatorName]) {

                    message = model.errorMessages[validatorName]
                        .replace(/\{\{\s*(.+?)\s*\}\}/mg, (match: string, expression: string) => {

                            let propertySource: any = model,
                                propertyName: string = expression;

                            if (expression.indexOf("validator.") >= 0) {

                                propertySource = this.control.errors[validatorName];
                                propertyName = expression.replace("validator.", "");
                            }

                            return propertySource[propertyName] ? propertySource[propertyName] : null;
                        });

                } else {
                    message = `Error on "${validatorName}" validation`;
                }

                messages.push(message);
            }
        }

        return messages;
    }

    get hasHint(): boolean { // needed for AOT
        return (this.model as DynamicInputModel).hint !== null;
    }

    get hasList(): boolean { // needed for AOT
        return (this.model as DynamicInputModel).list !== null;
    }

    get hasEndTemplate(): boolean {
        return !!this.template && this.templateDirective.align === DYNAMIC_TEMPLATE_DIRECTIVE_ALIGN_END;
    }

    get hasStartTemplate(): boolean {
        return !!this.template && this.templateDirective.align === DYNAMIC_TEMPLATE_DIRECTIVE_ALIGN_START;
    }

    get showErrorMessages(): boolean {
        return this.control.touched && !this.hasFocus && this.isInvalid;
    }

    get isValid(): boolean {
        return this.control.valid;
    }

    get isInvalid(): boolean {
        return this.control.touched && this.control.invalid;
    }

    get templateDirectives(): QueryList<DynamicTemplateDirective> {
        return this.nestedTemplates ? this.nestedTemplates : this.templates;
    }

    protected setTemplates(): void {

        this.templateDirectives.forEach((directive: DynamicTemplateDirective) => {

            if (directive.type !== null) {
                return; // templates with type property need to be processed by concrete UI component
            }

            if (directive.modelType === this.model.type || directive.modelId === this.model.id) {

                this.templateDirective = directive;
                this.template = directive.templateRef;
            }
        });
    }

    protected setControlRelations(): void {

        let relActivation = relationUtils.findActivationRelation(this.model.relation);

        if (relActivation) {

            this.updateModelDisabled(relActivation);

            relationUtils.getRelatedFormControls(this.model, this.group).forEach(control => {

                this.subscriptions.push(control.valueChanges.subscribe(() => this.updateModelDisabled(relActivation)));
                this.subscriptions.push(control.statusChanges.subscribe(() => this.updateModelDisabled(relActivation)));
            });
        }
    }

    updateModelDisabled(relation: DynamicFormControlRelationGroup): void {

        this.model.disabledUpdates.next(relationUtils.isFormControlToBeDisabled(relation, this.group));
    }

    onControlValueChanges(value: DynamicFormControlValue): void {

        if (this.model instanceof DynamicFormValueControlModel) {

            let model = this.model as DynamicFormValueControlModel<DynamicFormControlValue>;

            if (model.value !== value) {
                model.valueUpdates.next(value);
            }
        }
    }

    onModelValueUpdates(value: DynamicFormControlValue): void {

        if (this.control.value !== value) {
            this.control.setValue(value);
        }
    }

    onModelDisabledUpdates(value: boolean): void {
        value ? this.control.disable() : this.control.enable();
    }

    onValueChange($event: Event | DynamicFormControlEvent | any): void {

        if ($event instanceof Event) { // native HTML5 change event

            $event.stopPropagation();

            if (this.model.type === DYNAMIC_FORM_CONTROL_TYPE_INPUT) {

                let model = this.model as DynamicInputModel;

                if (model.inputType === DYNAMIC_FORM_CONTROL_INPUT_TYPE_FILE) {

                    let inputElement: any = ($event as Event).target || ($event as Event).srcElement;

                    model.files = inputElement.files as FileList;
                }
            }

            this.change.emit(
                {
                    $event: $event as Event,
                    context: this.context,
                    control: this.control,
                    group: this.group,
                    model: this.model
                }
            );

        } else if ($event.hasOwnProperty("$event") && $event.hasOwnProperty("control") && $event.hasOwnProperty("model")) {

            this.change.emit($event as DynamicFormControlEvent);

        } else {

            this.change.emit(
                {
                    $event: $event,
                    context: this.context,
                    control: this.control,
                    group: this.group,
                    model: this.model
                }
            );
        }
    }

    onFilterChange($event: any | DynamicFormControlEvent): void {
        // TODO
    }

    onFocusChange($event: FocusEvent | DynamicFormControlEvent): void {

        let emitValue;

        if ($event instanceof FocusEvent) {

            $event.stopPropagation();

            emitValue = {
                $event: $event,
                context: this.context,
                control: this.control,
                group: this.group,
                model: this.model
            };

            if ($event.type === "focus") {

                this.hasFocus = true;
                this.focus.emit(emitValue);

            } else {

                this.hasFocus = false;
                this.blur.emit(emitValue);
            }

        } else {

            emitValue = $event as DynamicFormControlEvent;

            if ((emitValue.$event as FocusEvent).type === "focus") {

                this.focus.emit(emitValue);

            } else {

                this.blur.emit(emitValue);
            }
        }
    }
}