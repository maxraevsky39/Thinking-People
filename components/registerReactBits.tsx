import { registerComponent } from '@plasmicapp/react-web/lib/host';
import { ContactSheet } from './ContactSheet';
import { About13 } from './About13';

export function registerReactBits() {
  registerComponent(ContactSheet, {
    name: 'ContactSheet', displayName: 'Contact Sheet',
    importPath: './components/ContactSheet', importName: 'ContactSheet',
    defaultStyles: { width: '100%', height: '600px' },
    props: {
      items: { type: 'array', displayName: 'Фотографии', itemType: { type: 'object', fields: {
        src: { type: 'imageUrl', displayName: 'Фото' }, alt: 'string', title: 'string', subtitle: 'string', href: 'string',
      }}},
      count: {type:'number',defaultValue:18,min:1,max:96},
      speed: {type:'number',defaultValue:0.1}, rush: {type:'number',defaultValue:0.35},
      spiral: {type:'number',defaultValue:0}, blankArea: {type:'number',defaultValue:0.2},
      size: {type:'number',defaultValue:0.17}, sizeVariance: {type:'number',defaultValue:0.25},
      aspect: {type:'number',defaultValue:0.8}, radius: {type:'number',defaultValue:12},
      border: {type:'number',defaultValue:0}, borderColor: {type:'color',defaultValue:'#ffffff'},
      rim: {type:'number',defaultValue:0.12}, roll: {type:'number',defaultValue:0},
      develop: {type:'number',defaultValue:0.85}, edgeFade: {type:'number',defaultValue:0.35},
      shadow: {type:'number',defaultValue:0.5}, hoverSlow: {type:'number',defaultValue:0.6},
      catchOnHover: {type:'boolean',defaultValue:true}, draggable: {type:'boolean',defaultValue:true},
      wheel: {type:'boolean',defaultValue:true}, captions: {type:'boolean',defaultValue:true},
      backgroundColor: {type:'color',defaultValue:'transparent'}, paused: {type:'boolean',defaultValue:false},
      dpr: {type:'number',defaultValue:2,min:1,max:3}, ariaLabel: 'string',
      onOpen: { type:'eventHandler', argTypes:[{name:'item',type:'object'},{name:'index',type:'number'}]},
      onClose: { type:'eventHandler', argTypes:[] },
    },
  });
  registerComponent(About13, {
    name:'About13', displayName:'About 13', importPath:'./components/About13', importName:'About13',
    defaultStyles:{width:'100%'},
    props:{
      heading:{type:'string',displayName:'Вводный заголовок',defaultValue:'We stay'},
      description:{type:'string',displayName:'Описание',defaultValue:'Four habits we hire for, work by and hold each other to.'},
      wordClassName: {type:'class',displayName:'Стиль: Главное слово'},
      headingClassName: {type:'class',displayName:'Стиль: Вводный заголовок'},
      descriptionClassName: {type:'class',displayName:'Стиль: Описание'},
      containerClassName: {type:'class',displayName:'Стиль: Внутренний контейнер'},
      introClassName: {type:'class',displayName:'Стиль: Верхний блок'},
      valuesClassName: {type:'class',displayName:'Стиль: Сетка ценностей'},
      itemClassName: {type:'class',displayName:'Стиль: Карточки / кнопки'},
      trackClassName: {type:'class',displayName:'Стиль: Линия индикатора'},
      progressClassName: {type:'class',displayName:'Стиль: Заполнение индикатора'},
      nameClassName: {type:'class',displayName:'Стиль: Все name'},
      activeNameClassName: {type:'class',displayName:'Стиль: Активный name'},
      lineClassName: {type:'class',displayName:'Стиль: Все line'},
      activeLineClassName: {type:'class',displayName:'Стиль: Активный line'},
      flashDark: {type:'color',displayName:'Цвет вспышки на тёмном фоне',defaultValue:"#ffc247"},
      flashLight: {type:'color',displayName:'Цвет вспышки на светлом фоне',defaultValue:"#ffaa00"},
      interval: {type:'number',displayName:'Интервал смены, сек.',defaultValue:3.6,min:0.1,max:3600,step:0.01},
      duration: {type:'number',displayName:'Длительность морфинга, сек.',defaultValue:1.1,min:0.05,max:60,step:0.01},
      stagger: {type:'number',displayName:'Задержка между буквами',defaultValue:0.25,min:0,max:0.95,step:0.01},
      travel: {type:'number',displayName:'Перемещение букв',defaultValue:0.5,min:0,max:2,step:0.01},
      goo: {type:'number',displayName:'Слияние букв',defaultValue:0.1,min:0,max:1,step:0.01},
      swell: {type:'number',displayName:'Расширение букв',defaultValue:0.02,min:0,max:1,step:0.01},
      softness: {type:'number',displayName:'Мягкость',defaultValue:0.8,min:0,max:4,step:0.01},
      zoom: {type:'number',displayName:'Масштабирование',defaultValue:0.04,min:0,max:0.9,step:0.01},
      tint: {type:'number',displayName:'Интенсивность вспышки',defaultValue:0.45,min:0,max:1,step:0.01},
      paused:{type:'boolean',displayName:'Пауза',defaultValue:false},
      pauseOnHover:{type:'boolean',displayName:'Выбор при наведении',defaultValue:true},
      entranceAnimation:{type:'boolean',displayName:'Анимация появления',defaultValue:true},
      ariaLabel:{type:'string',displayName:'Описание списка для скринридера',defaultValue:'Our values'},
      values:{type:'array',displayName:'Ценности',itemType:{type:'object',fields:{word:'string',name:'string',line:'string'}}},
    },
  });
}
