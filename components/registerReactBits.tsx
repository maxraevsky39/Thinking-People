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
      heading:{type:'string',defaultValue:'We stay'},
      description:{type:'string',defaultValue:'Four habits we hire for, work by and hold each other to.'},
      values:{type:'array',displayName:'Ценности',itemType:{type:'object',fields:{word:'string',name:'string',line:'string'}}},
    },
  });
}
