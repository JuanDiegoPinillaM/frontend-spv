import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptors';

// 1. Importamos TODOS los iconos necesarios
import { FeatherModule } from 'angular-feather';
import { 
  Home, ShoppingCart, Package, Users, LogOut, Menu, Plus, Edit, Trash2, Search, Filter,
  Edit2, CheckCircle, XCircle, Slash, UserCheck, X, User, Mail, Lock, 
  Briefcase, Calendar, Shield,
  PlusCircle, Download, DollarSign, TrendingUp, Minus, BarChart2, 
  MoreVertical, PieChart, Clock, ArrowRight, Eye, Printer, List, UserPlus, UserX, UserMinus, Hash, Layers, AlertTriangle, AlertCircle, Info, HelpCircle, 
  Tag, FileText, File, Folder, FolderPlus, FolderMinus, Cloud, CloudRain, CloudLightning, CloudSnow, 
  CloudDrizzle, Sun, Moon, Wind, Umbrella, Thermometer, BatteryCharging, ToggleRight, Bell, BellOff,
   Map, MapPin, Compass, Navigation, Globe, Aperture, Camera, Video, Film, Music, Mic, Volume1, Volume2, VolumeX,
   BookOpen, Book, Bookmark, Code, Codepen, Codesandbox, Terminal, Cpu, Server, HardDrive, Database, Wifi, Bluetooth,
   Smartphone, Tablet, Tv, Watch, Airplay, Cast, Phone, PhoneCall, PhoneForwarded, PhoneIncoming, PhoneMissed, PhoneOff,
   ShoppingBag, CreditCard, Pocket, Settings, Box, PlusSquare,
   Inbox, Grid, ChevronDown, Check
} from 'angular-feather/icons';

// 2. Los agregamos al objeto de configuración
const icons = { 
  Home, ShoppingCart, Package, Users, LogOut, Menu, Plus, Edit, Trash2, Search, Filter,
  Edit2, CheckCircle, XCircle, Slash, UserCheck, X, User, Mail, Lock, 
  Briefcase, CreditCard, Calendar, Shield,
  PlusCircle, Download, DollarSign, TrendingUp, Minus, BarChart2, 
  MoreVertical, PieChart, Clock, ArrowRight, Eye, Printer,
  List, UserPlus, UserX, UserMinus, Hash, Layers, AlertTriangle, AlertCircle, Info, HelpCircle,
  Tag, FileText, File, Folder, FolderPlus, FolderMinus, Cloud, CloudRain, CloudLightning, CloudSnow,
  CloudDrizzle, Sun, Moon, Wind, Umbrella, Thermometer, BatteryCharging, ToggleRight, Bell, BellOff,
  Map, MapPin, Compass, Navigation, Globe, Aperture, Camera, Video, Film, Music, Mic, Volume1, Volume2, VolumeX,
  BookOpen, Book, Bookmark, Code, Codepen, Codesandbox, Terminal, Cpu, Server, HardDrive, Database, Wifi, Bluetooth,
  Smartphone, Tablet, Tv, Watch, Airplay, Cast, Phone, PhoneCall, PhoneForwarded, PhoneIncoming, PhoneMissed, PhoneOff,
  ShoppingBag, Pocket, Settings, Box, PlusSquare, Inbox, Grid, ChevronDown, Check
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),

    importProvidersFrom(
      SweetAlert2Module.forRoot(),
      // 3. Registramos los iconos globalmente
      FeatherModule.pick(icons)
    ),
    
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};