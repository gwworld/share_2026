import Vue from 'vue';
import Router from 'vue-router';
import RulesView from '../views/RulesView.vue';
import TemplatesView from '../views/TemplatesView.vue';
import LayersView from '../views/LayersView.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: '/rules'
    },
    {
      path: '/rules',
      name: 'Rules',
      component: RulesView
    },
    {
      path: '/templates',
      name: 'Templates',
      component: TemplatesView
    },
    {
      path: '/layers',
      name: 'Layers',
      component: LayersView
    }
  ]
});
