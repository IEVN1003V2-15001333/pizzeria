import { Component, OnInit } from '@angular/core';
import { PedidoService } from '../pedido.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ResumenComponent } from '../resumen/resumen.component';

@Component({
  selector: 'app-detalle-pedido',
  templateUrl: './detalle-pedido.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ResumenComponent]

})
export class DetallePedidoComponent implements OnInit {
  pizzas: any[] = [];
  clienteDatos: { pizzas: any[], nombre: string } = { pizzas: [], nombre: '' };

  constructor(private pedidoService: PedidoService) {}

  ngOnInit() {
    this.cargarPizzas();
    this.cargarClienteDatos();

    // Suscribirse a los cambios en los detalles del cliente
    this.pedidoService.clienteDatosObservable.subscribe(datos => {
      this.clienteDatos = datos;
      this.pizzas = datos.pizzas; // Actualiza la lista de pizzas
    });
  }

  cargarPizzas() {
    const pizzasGuardadas = localStorage.getItem('pizzas');
    if (pizzasGuardadas) {
        this.pizzas = JSON.parse(pizzasGuardadas);
    } else {
        this.pizzas = this.pedidoService.obtenerPizzas();
    }
  }

  cargarClienteDatos() {
    const datosGuardados = localStorage.getItem('clienteDatos');
    if (datosGuardados) {
        this.clienteDatos = JSON.parse(datosGuardados);
        console.log('Datos cargados desde localStorage:', this.clienteDatos);
    } else {
        this.clienteDatos = this.pedidoService.obtenerClienteDatos();
        // Asegúrate de que el objeto cliente tenga la propiedad nombre
        this.clienteDatos.nombre = ''; // Inicializa el nombre si no hay datos
    }
  }

  agregarPizza(nuevaPizza: any) {
    this.pedidoService.agregarPizza(nuevaPizza);
    this.clienteDatos.pizzas.push(nuevaPizza);
    this.clienteDatos.nombre = 'nuevo nombre'; // Cambia esto por el nombre real que deseas establecer
    this.guardarClienteDatos();
  }

  eliminarPizza(index: number) {
    this.pedidoService.eliminarPizza(index);
    this.cargarClienteDatos();
  }

  quitarPizza(index: number) {
    this.clienteDatos.pizzas.splice(index, 1);
    this.guardarClienteDatos();
  }

  guardarClienteDatos() {
    localStorage.removeItem('clienteDatos');
    localStorage.setItem('clienteDatos', JSON.stringify(this.clienteDatos));
    console.log('Datos guardados en localStorage:', this.clienteDatos);
  }

  hayPizzasSeleccionadas(): boolean {
    return this.pizzas.some(pizza => pizza.selected);
  }

  quitarSeleccionadas() {
    const pizzas = this.pedidoService.obtenerClienteDatos().pizzas;
    this.pedidoService.actualizarPizzas(pizzas.filter(pizza => !pizza.selected));
  }

  quitarPizzasSeleccionadas() {
    this.pizzas = this.pizzas.filter(pizza => !pizza.selected);
    this.guardarPizzas();
  }

  guardarPizzas() {
    localStorage.setItem('pizzas', JSON.stringify(this.pizzas));
  }

  calculateSubtotal(pizza: any): number {
    let subtotal = 0;

    // Agregar costo del tamaño de la pizza
    if (pizza.tamano === 'Chica') {
        subtotal += 40;
    } else if (pizza.tamano === 'Mediana') {
        subtotal += 80;
    } else if (pizza.tamano === 'Grande') {
        subtotal += 120;
    }

    // Agregar costo de ingredientes
    if (pizza.ingredientes.includes('jamon')) subtotal += 10;
    if (pizza.ingredientes.includes('pina')) subtotal += 10;
    if (pizza.ingredientes.includes('champinones')) subtotal += 10;

    // Multiplicar por el número de pizzas
    subtotal *= pizza.numPizzas;

    return subtotal;
  }

  terminarPedido() {
    const total = this.pizzas.reduce((acc, pizza) => acc + this.calculateSubtotal(pizza), 0);
    const confirmacion = confirm(`El costo total del pedido es: ${total.toFixed(2)}. ¿Está de acuerdo?`);

    if (confirmacion) {
        // Guardar en LocalStorage
        const ventas = JSON.parse(localStorage.getItem('ventas') || '[]');
        const fecha = new Date().toLocaleDateString();
        
        // Asegúrate de que el nombre del cliente esté disponible
        const cliente = this.clienteDatos.nombre; // Asegúrate de que el nombre del cliente esté disponible

        ventas.push({ cliente, total, fecha });
        localStorage.setItem('ventas', JSON.stringify(ventas));

        // Aquí puedes implementar la lógica para finalizar el pedido
        this.guardarDatosEnLocalStorage(); // Llama a la función para guardar datos
    } else {
        // Permitir edición de lo que compró
    }
  }

  reiniciarPedido() {
    this.pizzas = []; // Reinicia la lista de pizzas
    this.clienteDatos.pizzas = []; // Reinicia los datos del cliente
    this.guardarClienteDatos(); // Guarda los cambios en localStorage
    this.guardarPizzas(); // Guarda los cambios en localStorage
    console.log('Pedido reiniciado');
  }

  guardarDatosEnLocalStorage() {
    const datosResumen = this.pizzas.filter(pizza => pizza.selected); // Filtra las pizzas seleccionadas
    localStorage.setItem('resumenPedido', JSON.stringify(datosResumen)); // Guarda en localStorage
  }
}