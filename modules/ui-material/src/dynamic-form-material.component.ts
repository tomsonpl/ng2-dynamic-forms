import { Component, ContentChildren, Input, EventEmitter, OnInit, Output, QueryList, ViewChild } from "@angular/core";
import { FormGroup } from "@angular/forms";
import {
    MdAutocomplete,
    MdCheckbox,
    MdDatepicker,
    MdInputContainer,
    MdRadioGroup,
    MdSelect,
    MdSlider,
    MdSlideToggle
} from "@angular/material";
import {
    DynamicFormControlComponent,
    DynamicFormControlModel,
    DynamicFormArrayGroupModel,
    DynamicFormControlEvent,
    DynamicTemplateDirective,
    DynamicInputModel,
    DYNAMIC_FORM_CONTROL_TYPE_ARRAY,
    DYNAMIC_FORM_CONTROL_TYPE_CHECKBOX,
    DYNAMIC_FORM_CONTROL_TYPE_CHECKBOX_GROUP,
    DYNAMIC_FORM_CONTROL_TYPE_DATEPICKER,
    DYNAMIC_FORM_CONTROL_TYPE_GROUP,
    DYNAMIC_FORM_CONTROL_TYPE_INPUT,
    DYNAMIC_FORM_CONTROL_TYPE_RADIO_GROUP,
    DYNAMIC_FORM_CONTROL_TYPE_SELECT,
    DYNAMIC_FORM_CONTROL_TYPE_SLIDER,
    DYNAMIC_FORM_CONTROL_TYPE_SWITCH,
    DYNAMIC_FORM_CONTROL_TYPE_TEXTAREA
} from "@ng2-dynamic-forms/core";

export const enum MdFormControlType {

    Array = "ARRAY",
    Checkbox = "CHECKBOX",
    DatePicker = "DATEPICKER",
    Group = "GROUP",
    Input = "INPUT",
    RadioGroup = "RADIO_GROUP",
    Select = "SELECT",
    Slider = "SLIDER",
    SlideToggle = "SLIDE_TOGGLE",
    TextArea = "TEXTAREA"
}

@Component({

    moduleId: module.id,
    selector: "dynamic-form-material-control",
    templateUrl: "./dynamic-form-material.component.html"
})

export class DynamicFormMaterialComponent extends DynamicFormControlComponent implements OnInit {

    private _showCharacterCount: boolean = false;

    @Input() bindId: boolean = true;
    @Input() context: DynamicFormArrayGroupModel = null;
    @Input() group: FormGroup;
    @Input() hasErrorMessaging: boolean = false;
    @Input() model: DynamicFormControlModel;
    @Input() nestedTemplates: QueryList<DynamicTemplateDirective>;

    @Input()
    get showCharacterHint(): boolean {
        return !!(this._showCharacterCount && (this.model as DynamicInputModel).maxLength && this.characterCount);
    }

    set showCharacterHint(value: boolean) {
        this._showCharacterCount = value;
    }

    @Output() blur: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();
    @Output() change: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();
    @Output() focus: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();

    @ContentChildren(DynamicTemplateDirective) templates: QueryList<DynamicTemplateDirective>;

    @ViewChild(MdAutocomplete) mdAutocomplete: MdAutocomplete | null;
    @ViewChild(MdCheckbox) mdCheckbox: MdCheckbox | null;
    @ViewChild(MdDatepicker) mdDatepicker: MdDatepicker<Date> | null;
    @ViewChild(MdInputContainer) mdInputContainer: MdInputContainer | null;
    @ViewChild(MdRadioGroup) mdRadioGroup: MdRadioGroup | null;
    @ViewChild(MdSelect) mdSelect: MdSelect | null;
    @ViewChild(MdSlider) mdSlider: MdSlider | null;
    @ViewChild(MdSlideToggle) mdSlideToggle: MdSlideToggle | null;

    type: MdFormControlType | null;

    constructor() {
        super();
    }

    ngOnInit() {
        super.ngOnInit();

        this.type = DynamicFormMaterialComponent.getFormControlType(this.model);
    }

    get characterCount(): number | null {
        return this.mdInputContainer ? this.mdInputContainer._mdInputChild.value.length : null;
    }

    static getFormControlType(model: DynamicFormControlModel): MdFormControlType | null {

        switch (model.type) {

            case DYNAMIC_FORM_CONTROL_TYPE_ARRAY:
                return MdFormControlType.Array;

            case DYNAMIC_FORM_CONTROL_TYPE_CHECKBOX:
                return MdFormControlType.Checkbox;

            case DYNAMIC_FORM_CONTROL_TYPE_CHECKBOX_GROUP:
            case DYNAMIC_FORM_CONTROL_TYPE_GROUP:
                return MdFormControlType.Group;

            case DYNAMIC_FORM_CONTROL_TYPE_DATEPICKER:
                return MdFormControlType.DatePicker;

            case DYNAMIC_FORM_CONTROL_TYPE_INPUT:
                return MdFormControlType.Input;

            case DYNAMIC_FORM_CONTROL_TYPE_RADIO_GROUP:
                return MdFormControlType.RadioGroup;

            case DYNAMIC_FORM_CONTROL_TYPE_SELECT:
                return MdFormControlType.Select;

            case DYNAMIC_FORM_CONTROL_TYPE_SLIDER:
                return MdFormControlType.Slider;

            case DYNAMIC_FORM_CONTROL_TYPE_SWITCH:
                return MdFormControlType.SlideToggle;

            case DYNAMIC_FORM_CONTROL_TYPE_TEXTAREA:
                return MdFormControlType.TextArea;

            default:
                return null;
        }
    }
}