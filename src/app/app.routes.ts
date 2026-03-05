import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./home/home').then(m => m.Home)
        // loadComponent: () => import('./gallery-component/gallery.component').then(m => m.GalleryComponent)
    },
    {
        path:'home',
        loadComponent: () => import('./home/home').then(m => m.Home)
    },
    {
        path:'privacy',
        loadComponent: () => import('./privacy-policy/privacy-policy').then(m => m.PrivacyPolicy)
    }
];
