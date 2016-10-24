if (document.querySelectorAll('p').length) {
    require.ensure([],(require)=>{
        const Button = require('./Components/Button').default;
        const button = new Button('google.com-1111');
        button.render('p.btn2');
    },'button');
}

if (document.querySelectorAll('h1').length) {
    require.ensure([],(require)=>{
        const Header = require('./Components/Header').default;

        new Header().render('h1');
    },'header');
}