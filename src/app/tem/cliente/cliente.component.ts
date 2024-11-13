import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PedidoService } from '../pedido.service';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
})
export class ClienteComponent {
  pizzaForm: FormGroup;
  mostrarTabla: boolean = false; // Variable para controlar la visibilidad de la tabla

  constructor(private fb: FormBuilder, private pedidoService: PedidoService) {
    this.pizzaForm = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      fecha: ['', Validators.required],
      tamanoPizza: ['', Validators.required],
      ingredientes: this.fb.group({
        jamon: [false],
        pina: [false],
        champinones: [false],
      }),
      numPizzas: ['', [Validators.required, Validators.min(1)]],
    });
  }

  agregarPizza() {
    const clienteActual = this.pedidoService.obtenerClienteDatos();
    const nombreIngresado = this.pizzaForm.value.nombre;

    // Actualizar el nombre del cliente si es diferente
    if (clienteActual.nombre !== nombreIngresado) {
      clienteActual.nombre = nombreIngresado; // Actualiza el nombre del cliente
    }

    const pizza = {
      tamano: this.pizzaForm.value.tamanoPizza,
      ingredientes: this.obtenerIngredientesSeleccionados(),
      numPizzas: this.pizzaForm.value.numPizzas,
      subtotal: this.calcularSubtotal(),
    };

    // Verificar si la pizza ya existe
    const pizzaExistente = clienteActual.pizzas.find(p => 
      p.tamano === pizza.tamano && 
      JSON.stringify(p.ingredientes) === JSON.stringify(pizza.ingredientes)
    );

    if (pizzaExistente) {
      // Si existe, actualizar el número de pizzas y el subtotal
      pizzaExistente.numPizzas += pizza.numPizzas;
      pizzaExistente.subtotal += pizza.subtotal;
    } else {
      // Si no existe, agregar la nueva pizza
      clienteActual.pizzas.push(pizza);
    }

    // Guardar los datos del cliente actualizados
    this.pedidoService.guardarClienteDatos(clienteActual);

    // Agregar el nombre del cliente a las ventas del día
    this.pedidoService.guardarDatos(clienteActual, pizza); // Asegúrate de que este método esté implementado

    // Reinicia el formulario pero mantiene los validadores
    this.pizzaForm.reset({
      nombre: this.pizzaForm.value.nombre,
      direccion: this.pizzaForm.value.direccion,
      telefono: this.pizzaForm.value.telefono,
      fecha: this.pizzaForm.value.fecha,
      tamanoPizza: this.pizzaForm.value.tamanoPizza,
      ingredientes: this.pizzaForm.value.ingredientes,
      numPizzas: this.pizzaForm.value.numPizzas,
    });

    // Emitir un evento o llamar a un método para actualizar la vista de detalles
    this.pedidoService.actualizarDetalles(clienteActual); // Asegúrate de implementar este método

    this.mostrarTabla = true; // Muestra la tabla después de agregar la pizza

    // Mostrar los datos de la pizza agregada
    console.log('Pizza agregada:', pizza);
    console.log('Datos del cliente actual:', clienteActual);
  }

  obtenerIngredientesSeleccionados() {
    const ingredientes = this.pizzaForm.value.ingredientes;
    return Object.keys(ingredientes).filter(ingrediente => ingredientes[ingrediente]);
  }

  calcularSubtotal() {
    const precios: { [key: string]: number } = {
      'Chica': 40,
      'Mediana': 80,
      'Grande': 120,
    };
    const tamano = this.pizzaForm.value.tamanoPizza as keyof typeof precios;
    const numPizzas = this.pizzaForm.value.numPizzas;

    // Calcular el subtotal de la pizza
    const subtotalPizza = precios[tamano] * numPizzas;

    // Calcular el costo de los ingredientes seleccionados
    const ingredientesSeleccionados = this.obtenerIngredientesSeleccionados();
    const costoIngredientes = ingredientesSeleccionados.length * 10; // Suponiendo que cada ingrediente cuesta $10

    return subtotalPizza + costoIngredientes; // Sumar el subtotal de la pizza y el costo de los ingredientes
  }

  toggleIngrediente(ingrediente: string) {
    const ingredientes = this.pizzaForm.get('ingredientes') as FormGroup;
    ingredientes.patchValue({
      [ingrediente]: !ingredientes.value[ingrediente],
    });
  }
}