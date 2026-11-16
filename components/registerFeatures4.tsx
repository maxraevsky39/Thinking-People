import { registerComponent } from '@plasmicapp/react-web/lib/host';
import { Features4 } from './Features4';
export function registerFeatures4() {
 registerComponent(Features4, {
 name:'Features4',displayName:'Features 4 — Challenge Tabs',importPath:'./components/Features4',importName:'Features4',defaultStyles:{width:'100%'},
 props:{
 items:{type:'array',displayName:'Направления',description:'Привяжите groups из существующего fetch. Компонент не делает собственных запросов.',itemType:{type:'object',fields:{title:'string',description:'string',icon:{type:'object',fields:{url:'imageUrl',alternativeText:'string'}},cards:{type:'array',itemType:{type:'object',fields:{title:'string',description:'string'}}}}}},
 defaultActiveIndex:{type:'number',displayName:'Начальная вкладка (с 0)',defaultValue:0,min:0},
 activeIndex:{type:'number',displayName:'Принудительная вкладка (с 0)',description:'Оставьте пустым для интерактивного переключения.',min:0},
 autoPlay:{type:'boolean',displayName:'Автопереключение',defaultValue:false},interval:{type:'number',displayName:'Интервал, мс',defaultValue:10000,min:1000},
 animationDuration:{type:'number',displayName:'Анимация, мс',defaultValue:300,min:0},
 showNumbers:{type:'boolean',displayName:'Нумерация',defaultValue:true},showIcons:{type:'boolean',displayName:'Иконки',defaultValue:false},showDescriptions:{type:'boolean',displayName:'Описания направлений',defaultValue:false},showProgress:{type:'boolean',displayName:'Индикатор таймера',defaultValue:false},
 navigationGap:{type:'number',displayName:'Между вкладками, px',defaultValue:12,min:0},
 navigationWidth:{type:'number',displayName:'Ширина навигации, %',defaultValue:35,min:15,max:60},columnGap:{type:'number',displayName:'Между колонками, px',defaultValue:48,min:0},itemsGap:{type:'number',displayName:'Между проблемами, px',defaultValue:24,min:0},
 panelHeightMode:{type:'choice',displayName:'Высота панели',options:['tallest','content'],defaultValue:'tallest'},mobileBreakpoint:{type:'number',displayName:'Мобильный режим до, px',defaultValue:768,min:320},mobileLayout:{type:'choice',displayName:'Мобильный вид',options:['accordion','tabs'],defaultValue:'accordion'},
 navigationClassName:{type:'class',displayName:'Стиль: Левая колонка'},
 pauseOnHover:{type:'boolean',displayName:'Пауза при наведении',defaultValue:true},pauseOnFocus:{type:'boolean',displayName:'Пауза при фокусе',defaultValue:true},stopAfterInteraction:{type:'boolean',displayName:'Остановить после клика',defaultValue:false},
 containerClassName:{type:'class',displayName:'Стиль: Контейнер'},tabClassName:{type:'class',displayName:'Стиль: Вкладка'},activeTabClassName:{type:'class',displayName:'Стиль: Активная вкладка'},numberClassName:{type:'class',displayName:'Стиль: Номер / иконка'},titleClassName:{type:'class',displayName:'Стиль: Названия направлений'},descriptionClassName:{type:'class',displayName:'Стиль: Описания направлений'},panelClassName:{type:'class',displayName:'Стиль: Панель'},cardClassName:{type:'class',displayName:'Стиль: Карточка проблемы'},cardTitleClassName:{type:'class',displayName:'Стиль: Заголовки проблем'},cardDescriptionClassName:{type:'class',displayName:'Стиль: Описания проблем'},progressClassName:{type:'class',displayName:'Стиль: Индикатор'},
 onActiveChange:{type:'eventHandler',argTypes:[{name:'index',type:'number'}]}
 }
 });
}
