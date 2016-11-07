
import Vue from 'vue'
const Foo = { template: '<div>foo</div>' }
const Bar = { template: '<div>bar</div>' }
const User = {template: '<div>User {{ $route.params.id }}</div>'}
var routerConfig=[
  { path: '/foo', component: Foo },
  { path: '/bar', component: Bar },
  { path: '/user/:id', component: User }
]
module.exports=routerConfig;