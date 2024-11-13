import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgModule } from '@angular/core';
import { DetallePedidoComponent } from './tem/detalle-pedido/detalle-pedido.component';
import { ResumenComponent } from './tem/resumen/resumen.component';
import { ClienteComponent } from './tem/cliente/cliente.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [DetallePedidoComponent, ResumenComponent, ClienteComponent]


})
export class AppComponent {
  
}

