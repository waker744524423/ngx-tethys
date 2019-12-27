import {
    Component,
    Input,
    TemplateRef,
    ViewChild,
    ChangeDetectionStrategy,
    HostBinding,
    HostListener,
    ElementRef,
    ChangeDetectorRef,
    EventEmitter,
    OnDestroy,
    Output,
    Inject,
    Optional,
    QueryList
} from '@angular/core';
import { Highlightable } from '@angular/cdk/a11y';
import { SelectOptionBase } from '../../core/select/select-option/select-option-base';
import { ENTER, SPACE, hasModifierKey } from '../../util/keycodes';
import {
    IThySelectOptionGroupComponent,
    IThyCustomSelectComponent,
    THY_CUSTOM_SELECT_COMPONENT,
    THY_SELECT_OPTION_GROUP_COMPONENT
} from './custom-select.component.token';

export class ThyOptionSelectionChangeEvent {
    constructor(public option: ThyOptionComponent, public isUserInput = false) {}
}

export class ThyOptionVisibleChangeEvent {
    option: ThyOptionComponent;
}

@Component({
    selector: 'thy-option',
    templateUrl: './option.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThyOptionComponent extends SelectOptionBase implements OnDestroy, Highlightable {
    private _selected = false;
    private _hidden = false;
    private _disabled = false;

    @Input() thyValue: any;

    @Input() thyRawValue: any;

    @Input() thyLabelText: string;

    @Input() thyShowOptionCustom: boolean;

    @Input() thySearchKey: string;

    @HostBinding('class.thy-option-item') _isOptionItem = true;

    @ViewChild(TemplateRef) template: TemplateRef<any>;

    @Input()
    @HostBinding(`class.disabled`)
    set thyDisabled(value: boolean) {
        this._disabled = value;
    }

    get thyDisabled(): boolean {
        return this._disabled;
    }

    get disabled(): boolean {
        return this.hidden || this._disabled;
    }

    @HostBinding('class.hidden')
    get hidden(): boolean {
        return this._hidden;
    }

    @HostBinding('attr.tabindex')
    get tabIndex(): string {
        return this.disabled ? '-1' : '0';
    }

    @HostBinding(`class.active`)
    get selected(): boolean {
        return this._selected;
    }

    @Output() readonly selectionChange: EventEmitter<ThyOptionSelectionChangeEvent> = new EventEmitter();
    @Output() readonly visibleChange: EventEmitter<ThyOptionVisibleChangeEvent> = new EventEmitter();

    constructor(
        public element: ElementRef<HTMLElement>,
        @Optional() @Inject(THY_CUSTOM_SELECT_COMPONENT) public parent: IThyCustomSelectComponent,
        @Optional() @Inject(THY_SELECT_OPTION_GROUP_COMPONENT) public group: IThySelectOptionGroupComponent,
        private cdr: ChangeDetectorRef
    ) {
        super();
    }

    getHostElement(): HTMLElement {
        return this.element.nativeElement;
    }

    @HostListener('click', ['$event'])
    onClick(event: Event) {
        this.selectViaInteraction();
    }

    @HostListener('keydown', ['$event'])
    handleKeydown(event: KeyboardEvent): void {
        if ((event.keyCode === ENTER || event.keyCode === SPACE) && !hasModifierKey(event)) {
            this.selectViaInteraction();
            event.preventDefault();
        }
    }

    selectViaInteraction(): void {
        if (!this.disabled) {
            this._selected = this.parent.isMultiple ? !this._selected : true;
            this.cdr.markForCheck();
            this.emitSelectionChangeEvent(true);
        }
    }

    select(event?: Event): void {
        if (!this.disabled) {
            if (!this._selected) {
                this._selected = true;
                this.emitSelectionChangeEvent();
                this.cdr.markForCheck();
            }
        }
    }

    deselect(): void {
        if (this._selected) {
            this._selected = false;
            this.emitSelectionChangeEvent();
            this.cdr.markForCheck();
        }
    }

    hideOption() {
        if (!this._hidden) {
            this._hidden = true;
            this.visibleChange.emit({ option: this });
            this.cdr.markForCheck();
        }
    }

    showOption() {
        if (this._hidden) {
            this._hidden = false;
            this.visibleChange.emit({ option: this });
            this.cdr.markForCheck();
        }
    }

    matchSearchText(searchText: string): boolean {
        if (this.thySearchKey) {
            if (this.thySearchKey.indexOf(searchText) >= 0) {
                return true;
            } else {
                return false;
            }
        } else {
            if (this.thyLabelText.indexOf(searchText) >= 0) {
                return true;
            } else {
                return false;
            }
        }
    }

    setActiveStyles(): void {
        this.getHostElement().classList.add('hover');
        this.cdr.markForCheck();
    }

    setInactiveStyles(): void {
        this.getHostElement().classList.remove('hover');
        this.cdr.markForCheck();
    }

    getLabel?(): string {
        return this.thyLabelText || (this.getHostElement().textContent || '').trim();
    }

    private emitSelectionChangeEvent(isUserInput = false): void {
        this.selectionChange.emit(new ThyOptionSelectionChangeEvent(this, isUserInput));
    }

    ngOnDestroy() {}
}