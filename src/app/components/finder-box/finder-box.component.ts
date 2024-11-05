import { ChangeDetectionStrategy, Component, computed, effect, OnDestroy, signal } from '@angular/core';
import { APIService } from '../../services/api.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Message } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-finder-box',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    CardModule, 
    ButtonModule,
    FormsModule, 
    InputTextModule, 
    FloatLabelModule,
    ProgressSpinnerModule,
    MessagesModule
  ],
  templateUrl: './finder-box.component.html',
  styleUrl: './finder-box.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [APIService]
})
export class FinderBoxComponent implements OnDestroy {

  pokemonSearch = signal('');
  loading = signal(false);
  pokemonData = signal<any>(null);
  animationArray = signal<string[]>([]);
  indiceActual = signal(0);
  animating = signal(false);
  mensaje = <Message[]>([]);
  value: string | undefined;

  imagenActual = computed(() => {
    const array = this.animationArray();
    return array.length > 0 ? array[this.indiceActual()] : '';
   })

  constructor(private apiService: APIService) {
    /*this.mensaje.push({
      severity: 'success',
      summary: '',
      detail: 'Página cargada con éxito'
    })*/
    effect(() => {
      if (this.animating()) {
        this.animateFrames();
      }
    });
  }

  ngOnDestroy(): void {
    this.detenerAnimacion();
  }

  loadPokemon(){
    if (this.pokemonSearch().length > 0) {
      this.detenerAnimacion();
      this.loading.set(true);
      this.apiService.obtenerPokemon(this.pokemonSearch()).subscribe({
        next: (data: any) => {
          this.pokemonData.set(data);
          this.loading.set(false);
          console.log(this.pokemonData());
          this.animationArray.set([
            data.sprites.front_default,
            data.sprites.back_default
          ]);
          this.iniciarAnimacion();
          this.playSound(this.pokemonData().cries.latest);
        },
        error: (error) => {
          console.error('Error al obtener los datos del Pokémon:', error);
          this.loading.set(false);
          this.mensajeError();
          //PONER COMPONENTE MENSAJE CON EL ERROR EN PANTALLA
        }
      });
    } else {
      this.mensajeAdvertencia();
      //PONER COMPONENTE MENSAJE
    }
  }

  iniciarAnimacion() {
    this.indiceActual.set(0);
    this.animating.set(true);
  }

  animateFrames(){
    setTimeout(() => {
      if (this.animating()){
        this.indiceActual.update((i) => (i + 1) % this.animationArray().length);
        this.animateFrames();
      }
    }, 300)
  }

  detenerAnimacion() {
    this.animating.set(false);
    //this.indiceActual.set(0);
  }  

  playSound(soundSource: string){
    const audio = new Audio();
    audio.src = soundSource;
    audio.load();
    audio.play();
  }

  updateName(name: string) {
    this.pokemonSearch.set(name.toLocaleLowerCase());
  }

  mensajeError(){
    this.mensaje = [{
      severity: 'error',
      summary: 'Error:',
      detail: 'No se ha encontrado el pokemon, revisa que esté bien escrito'
    }]
  }

  mensajeAdvertencia(){  
    this.mensaje = [{
      severity: 'warn',
      summary: 'Advertencia:',
      detail: 'Debes introducir un nombre o ID'
    }]
  }

}
