import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface Cliente {
  nombre: string;
  direccion: string;
  telefono: string;
  fecha: string;
  pizzas: any[];
}

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private pizzasSubject = new BehaviorSubject<any[]>(this.obtenerPizzas());
  pizzas$ = this.pizzasSubject.asObservable();

  private clienteDatosSubject = new Subject<any>();
  clienteDatosObservable = this.clienteDatosSubject.asObservable();

  private clienteDatos: any;

  guardarDatos(cliente: Cliente, pedido: any) {
    localStorage.setItem('cliente', JSON.stringify(cliente));
    localStorage.setItem('pedido', JSON.stringify(pedido));
  }

  guardarClienteDatos(cliente: Cliente) {
    console.log('Datos guardados:', cliente);
    localStorage.setItem('nombre', cliente.nombre);
    localStorage.setItem('direccion', cliente.direccion);
    localStorage.setItem('telefono', cliente.telefono);
    localStorage.setItem('fecha', cliente.fecha);
    localStorage.setItem('pizzas', JSON.stringify(cliente.pizzas));
  }

  obtenerDatos() {
    return {
      cliente: JSON.parse(localStorage.getItem('cliente') || '{}'),
      pedido: JSON.parse(localStorage.getItem('pedido') || '{}'),
    };
  }

  obtenerClienteDatos(): Cliente {
    return {
      nombre: localStorage.getItem('nombre') || '',
      direccion: localStorage.getItem('direccion') || '',
      telefono: localStorage.getItem('telefono') || '',
      fecha: localStorage.getItem('fecha') || '',
      pizzas: this.obtenerPizzas(),
    };
  }

  eliminarDatos() {
    localStorage.removeItem('cliente');
    localStorage.removeItem('pedido');
    localStorage.removeItem('nombre');
    localStorage.removeItem('direccion');
    localStorage.removeItem('telefono');
    localStorage.removeItem('fecha');
    localStorage.removeItem('pizzas');
    this.pizzasSubject.next([]); // Notifica a los suscriptores que se han eliminado las pizzas
  }

  agregarPizza(pizza: any) {
    const pizzas = this.obtenerPizzas();
    pizzas.push(pizza);
    this.actualizarPizzas(pizzas);
  }

  eliminarPizza(index: number) {
    const pizzas = this.obtenerPizzas();
    if (index > -1 && index < pizzas.length) {
      pizzas.splice(index, 1);
      this.actualizarPizzas(pizzas);
    }
  }

  obtenerPizzas(): any[] {
    return JSON.parse(localStorage.getItem('pizzas') || '[]');
  }

  actualizarPizzas(pizzas: any[]) {
    localStorage.setItem('pizzas', JSON.stringify(pizzas));
    this.pizzasSubject.next(pizzas); // Notifica a los suscriptores sobre el cambio
  }

  actualizarDetalles(clienteActual: any) {
    this.clienteDatos = clienteActual;
    this.clienteDatosSubject.next(this.clienteDatos); // Emitir los cambios
  }
}