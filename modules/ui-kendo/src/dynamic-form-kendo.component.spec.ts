import { TestBed, async, inject, ComponentFixture } from "@angular/core/testing";
import { Type, DebugElement } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormControl } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { DateInputsModule } from "@progress/kendo-angular-dateinputs";
import { DropDownsModule } from "@progress/kendo-angular-dropdowns";
import { InputsModule } from "@progress/kendo-angular-inputs";
import { UploadModule } from "@progress/kendo-angular-upload";
import {
    DynamicFormsCoreModule,
    DynamicFormService,
    DynamicCheckboxModel,
    DynamicCheckboxGroupModel,
    DynamicDatePickerModel,
    DynamicEditorModel,
    DynamicFileUploadModel,
    DynamicFormArrayModel,
    DynamicFormControlModel,
    DynamicFormGroupModel,
    DynamicInputModel,
    DynamicRadioGroupModel,
    DynamicSelectModel,
    DynamicSliderModel,
    DynamicSwitchModel,
    DynamicTextAreaModel,
    DynamicTimePickerModel
} from "@ng2-dynamic-forms/core";
import { DynamicFormKendoComponent } from "./dynamic-form-kendo.component";
import { KendoFormControlType } from "./dynamic-form-kendo.const";

describe("DynamicFormKendoComponent test suite", () => {

    let formModel = [
            new DynamicCheckboxModel({id: "checkbox"}),
            new DynamicCheckboxGroupModel({id: "checkboxGroup", group: []}),
            new DynamicDatePickerModel({id: "datepicker"}),
            new DynamicEditorModel({id: "editor"}),
            new DynamicFileUploadModel({id: "upload", url: ""}),
            new DynamicFormArrayModel({id: "formArray", createGroup: () => []}),
            new DynamicFormGroupModel({id: "formGroup", group: []}),
            new DynamicInputModel({id: "input", maxLength: 51}),
            new DynamicRadioGroupModel({id: "radioGroup"}),
            new DynamicSelectModel({id: "select", options: [{value: "One"}, {value: "Two"}], value: "One"}),
            new DynamicSliderModel({id: "slider"}),
            new DynamicSwitchModel({id: "switch"}),
            new DynamicTextAreaModel({id: "textarea"}),
            new DynamicTimePickerModel({id: "timepicker"})
        ],
        testModel = formModel[9] as DynamicSelectModel<string>,
        formGroup: FormGroup,
        fixture: ComponentFixture<DynamicFormKendoComponent>,
        component: DynamicFormKendoComponent,
        debugElement: DebugElement,
        testElement: DebugElement;

    beforeEach(async(() => {

        TestBed.configureTestingModule({

            imports: [
                ReactiveFormsModule,
                DateInputsModule,
                DropDownsModule,
                InputsModule,
                UploadModule,
                DynamicFormsCoreModule.forRoot()
            ],
            declarations: [DynamicFormKendoComponent]

        }).compileComponents().then(() => {

            fixture = TestBed.createComponent(DynamicFormKendoComponent as Type<DynamicFormKendoComponent>);

            component = fixture.componentInstance;
            debugElement = fixture.debugElement;
        });
    }));

    beforeEach(inject([DynamicFormService], (service: DynamicFormService) => {

        formGroup = service.createFormGroup(formModel);

        component.group = formGroup;
        component.model = testModel;

        fixture.detectChanges();

        testElement = debugElement.query(By.css(`kendo-dropdownlist`));
    }));

    it("should initialize correctly", () => {

        expect(component.context).toBeNull();
        expect(component.control instanceof FormControl).toBe(true);
        expect(component.group instanceof FormGroup).toBe(true);
        expect(component.model instanceof DynamicFormControlModel).toBe(true);
        expect(component.hasErrorMessaging).toBe(false);

        expect(component.onControlValueChanges).toBeDefined();
        expect(component.onModelDisabledUpdates).toBeDefined();
        expect(component.onModelValueUpdates).toBeDefined();

        expect(component.blur).toBeDefined();
        expect(component.change).toBeDefined();
        expect(component.focus).toBeDefined();

        expect(component.onValueChange).toBeDefined();
        expect(component.onFocusChange).toBeDefined();

        expect(component.isValid).toBe(true);
        expect(component.isInvalid).toBe(false);

        expect(component.type).toEqual(KendoFormControlType.DropDownList);
    });

    it("should have correct view child", () => {

        expect(component.kendoDropDownList).toBeDefined();
    });

    it("should listen to focus events", () => {

        spyOn(component, "onFocus").and.callThrough();

        testElement.triggerEventHandler("focus", null);

        expect(component.onFocus).toHaveBeenCalled();
    });

    it("should listen to blur events", () => {

        spyOn(component, "onBlur").and.callThrough();

        testElement.triggerEventHandler("blur", null);

        expect(component.onBlur).toHaveBeenCalled();
    });

    it("should listen to native change event", () => {

        spyOn(component, "onValueChange");

        testElement.triggerEventHandler("valueChange", null);

        expect(component.onValueChange).toHaveBeenCalled();
    });

    it("should update model value when control value changes", () => {

        spyOn(component, "onControlValueChanges");

        component.ngOnInit();

        component.control.setValue("test");

        expect(component.onControlValueChanges).toHaveBeenCalled();
    });

    it("should update control value when model value changes", () => {

        spyOn(component, "onModelValueUpdates");

        component.ngOnInit();

        testModel.valueUpdates.next("Two");

        expect(component.onModelValueUpdates).toHaveBeenCalled();
    });

    it("should update control activation when model disabled property changes", () => {

        spyOn(component, "onModelDisabledUpdates");

        component.ngOnInit();

        testModel.disabledUpdates.next(true);

        expect(component.onModelDisabledUpdates).toHaveBeenCalled();
    });

    it("should determine correct form control type", () => {

        let testFn = DynamicFormKendoComponent.getFormControlType;

        expect(testFn(formModel[0])).toEqual(KendoFormControlType.Checkbox);

        expect(testFn(formModel[1])).toEqual(KendoFormControlType.CheckboxGroup);

        expect(testFn(formModel[2])).toEqual(KendoFormControlType.DatePicker);

        (formModel[2] as DynamicDatePickerModel).inline = true;
        expect(testFn(formModel[2])).toEqual(KendoFormControlType.Calendar);

        expect(testFn(formModel[3])).toBeNull();

        expect(testFn(formModel[4])).toEqual(KendoFormControlType.Upload);

        expect(testFn(formModel[5])).toEqual(KendoFormControlType.Array);

        expect(testFn(formModel[6])).toEqual(KendoFormControlType.Group);

        expect(testFn(formModel[7])).toEqual(KendoFormControlType.Input);

        (formModel[7] as DynamicInputModel).list = ["test1", "test2", "test3"];
        expect(testFn(formModel[7])).toEqual(KendoFormControlType.AutoComplete);

        (formModel[7] as DynamicInputModel).mask = "0000-0000-0000-0000";
        expect(testFn(formModel[7])).toEqual(KendoFormControlType.MaskedTextBox);

        (formModel[7] as DynamicInputModel).inputType = "date";
        expect(testFn(formModel[7])).toEqual(KendoFormControlType.DateInput);

        (formModel[7] as DynamicInputModel).inputType = "number";
        (formModel[7] as DynamicInputModel).mask = null;
        expect(testFn(formModel[7])).toEqual(KendoFormControlType.NumericTextBox);

        expect(testFn(formModel[8])).toEqual(KendoFormControlType.RadioGroup);

        expect(testFn(formModel[9])).toEqual(KendoFormControlType.DropDownList);

        (formModel[9] as DynamicSelectModel<string>).multiple = true;
        expect(testFn(formModel[9])).toEqual(KendoFormControlType.MultiSelect);

        expect(testFn(formModel[10])).toEqual(KendoFormControlType.Slider);

        expect(testFn(formModel[11])).toEqual(KendoFormControlType.Switch);

        expect(testFn(formModel[12])).toEqual(KendoFormControlType.TextArea);

        expect(testFn(formModel[13])).toEqual(KendoFormControlType.TimePicker);
    });
});