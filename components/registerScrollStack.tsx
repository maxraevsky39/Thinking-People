import {registerComponent} from '@plasmicapp/react-web/lib/host';
import {ScrollStack,ScrollStackCard,type ScrollStackProps} from './ScrollStack';
export function registerScrollStack(){
 registerComponent(ScrollStackCard,{name:'ScrollStackCard',displayName:'Scroll Stack Card',importPath:'./components/ScrollStack',importName:'ScrollStackCard',defaultStyles:{width:'100%'},props:{children:{type:'slot',displayName:'Содержимое карточки',defaultValue:[{type:'vbox',styles:{width:'100%',height:'100%',minHeight:'280px',padding:'32px',background:'#f0eeeb',borderRadius:'22px'},children:[{type:'text',value:'Ваша карточка'}]}]}}});
 registerComponent(ScrollStack,{name:'ScrollStack',displayName:'Scroll Stack',importPath:'./components/ScrollStack',importName:'ScrollStack',defaultStyles:{width:'100%'},props:{
 children:{type:'slot',displayName:'Карточки / Repeat',description:'Добавьте Scroll Stack Card и включите Repeat на нём. Ваш дизайн — в слоте Card. Каждый повтор станет отдельной карточкой.',defaultValue:[1,2,3].map(()=>({type:'component' as const,name:'ScrollStackCard',props:{}}))},
 scrollMode:{type:'choice',displayName:'Режим прокрутки',options:[{value:'stage',label:'Смена в закреплённой области'},{value:'flow',label:'Карточки подряд → стек'}],defaultValue:'stage',description:'В режиме «Карточки подряд» сохраняется высота вашего содержимого; карточки идут с небольшим промежутком и по очереди закрепляются под navbar. При подходе следующей карточки предыдущая уменьшается, смещается и затемняется как в Stack.'},
 flowGap:{type:'number',displayName:'Промежуток между карточками, px',defaultValue:24,min:0,hidden:(p:ScrollStackProps)=>p.scrollMode!=='flow'},
 variant:{hidden:(p:ScrollStackProps)=>p.scrollMode==='flow',type:'choice',displayName:'Эффект',options:['stack','deck','fade','flip','zoom','reveal'],defaultValue:'stack'},
 scrollLength:{hidden:(p:ScrollStackProps)=>p.scrollMode==='flow',type:'number',displayName:'Прокрутка на карточку, экраны',description:'1 = высота доступной области на один переход. Больше — медленнее смена.',defaultValue:1,min:.2,max:5,step:.1},
 stickyTop:{type:'number',displayName:'Отступ под navbar, px',defaultValue:80,min:0},
 fullWidth:{type:'boolean',displayName:'На всю ширину',description:'Убирает ограничение внутренней рамки. Ширина определяется внешним блоком и боковыми отступами.',defaultValue:false},
 cardWidth:{type:'number',displayName:'Максимальная ширина, px',description:'Можно задать 1200, 1440 и больше. Для заполнения родителя включите «На всю ширину».',defaultValue:880,min:200},
 cardHeight:{hidden:(p:ScrollStackProps)=>p.scrollMode==='flow',type:'number',displayName:'Высота карточки, % области',defaultValue:68,min:20,max:95},
 sidePadding:{type:'number',displayName:'Боковые отступы, px',defaultValue:24,min:0},
 borderRadius:{type:'number',displayName:'Скругление маски, px',description:'Обрезает края всего слота; оформление самой карточки задаётся внутри слота.',defaultValue:22,min:0},
 peek:{type:'number',displayName:'Сдвиг предыдущих карточек, px',defaultValue:26,min:0},
 scaleStep:{type:'number',displayName:'Уменьшение за шаг',defaultValue:.07,min:0,max:.15,step:.01},
 depth:{type:'number',displayName:'Видимых карточек позади',defaultValue:3,min:1,max:6},
 blur:{type:'number',displayName:'Размытие, px',defaultValue:4,min:0,max:30},
 dim:{type:'number',displayName:'Затемнение',defaultValue:.28,min:0,max:1,step:.05},
 smooth:{type:'number',displayName:'Плавность следования',description:'0 — мгновенно. Больше — плавнее и медленнее догоняет прокрутку.',defaultValue:.16,min:0,max:.95,step:.05},
 perspective:{hidden:(p:ScrollStackProps)=>p.scrollMode==='flow',type:'number',displayName:'Перспектива, px',defaultValue:1400,min:200},
 showProgress:{hidden:(p:ScrollStackProps)=>p.scrollMode==='flow',type:'boolean',displayName:'Полоса прогресса',defaultValue:true},showCounter:{hidden:(p:ScrollStackProps)=>p.scrollMode==='flow',type:'boolean',displayName:'Счётчик',defaultValue:true},progressColor:{hidden:(p:ScrollStackProps)=>p.scrollMode==='flow',type:'color',displayName:'Цвет индикатора'},
 mobileMode:{type:'choice',displayName:'Мобильный режим',options:[{value:'list',label:'Обычный список'},{value:'animate',label:'Анимация стека'}],defaultValue:'list'},
 mobileBreakpoint:{type:'number',displayName:'Мобильный экран до, px',defaultValue:767,min:0},listGap:{type:'number',displayName:'Отступ между карточками списка, px',defaultValue:24,min:0},
 previewInEditor:{type:'boolean',displayName:'Анимация на холсте Studio',description:'По умолчанию в редакторе показан список для удобной работы. В Preview анимация включается автоматически.',defaultValue:false},
 disabled:{type:'boolean',displayName:'Выключить стек / показать список',defaultValue:false},respectReducedMotion:{type:'boolean',displayName:'Учитывать reduced motion',defaultValue:true},
 cardSelector:{type:'string',displayName:'CSS-селектор карточек (необязательно)',description:'Для готового Repeat без Scroll Stack Card: задайте класс корня каждой карточки, например .stackCard. Поиск только внутри слота. Оставьте пустым при использовании Scroll Stack Card.'},
 frameClassName:{type:'class',displayName:'Стиль: Рамка стека'},hudClassName:{hidden:(p:ScrollStackProps)=>p.scrollMode==='flow',type:'class',displayName:'Стиль: Индикатор'},
 onIndexChange:{type:'eventHandler',displayName:'При смене карточки',argTypes:[{name:'index',type:'number'}]}
 }});
}
