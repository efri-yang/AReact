var $ = require('jquery');

require("./test1.css");
require("./test2.scss") // 载入 style.css
var tpl=require("./11.html");
$(function(){
	$('#x1').html(tpl);

})