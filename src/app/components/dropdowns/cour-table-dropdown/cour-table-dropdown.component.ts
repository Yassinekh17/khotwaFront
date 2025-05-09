import { Component, AfterViewInit, ViewChild,Input, Output, EventEmitter,ElementRef } from "@angular/core";
import { createPopper } from "@popperjs/core";

@Component({
  selector: "app-cour-table-dropdown",
  templateUrl: "./cour-table-dropdown.component.html",
})
export class CourTableDropdownComponent implements AfterViewInit {
  dropdownPopoverShow = false;
  @ViewChild("btnDropdownRef", { static: false }) btnDropdownRef: ElementRef;
  @ViewChild("popoverDropdownRef", { static: false })

  popoverDropdownRef: ElementRef;
  @Input() courId!: number;
  @Output() deleteCour = new EventEmitter<number>();
  @Output() updateCour = new EventEmitter<number>();
  ngAfterViewInit() {
    createPopper(
      this.btnDropdownRef.nativeElement,
      this.popoverDropdownRef.nativeElement,
      {
        placement: "bottom-start",
      }
    );
  }
  toggleDropdown(event) {
    event.preventDefault();
    if (this.dropdownPopoverShow) {
      this.dropdownPopoverShow = false;
    } else {
      this.dropdownPopoverShow = true;
    }
  }
  onDelete() {
    console.log(`Emitting delete event for cour ID: ${this.courId}`);
    this.deleteCour.emit(this.courId);
    this.toggleDropdown(new Event('click'));
  }
  onUpdate() {
    console.log(`Update clicked for cour ID: ${this.courId}`);
    this.updateCour.emit(this.courId);
    this.toggleDropdown(new Event('click'));
  }
  
}
