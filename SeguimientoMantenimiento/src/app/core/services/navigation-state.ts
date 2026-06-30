import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NavigationStateService {
  private _isSidebarVisible = signal<boolean>(false);

  isSidebarVisible = this._isSidebarVisible.asReadonly();

  toggleSidebar() {
    this._isSidebarVisible.update((visible) => !visible);
  }
  setSidebarVisible(visible: boolean) {
    this._isSidebarVisible.set(visible);
  }
}
