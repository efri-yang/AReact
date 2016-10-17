if (document.querySelectorAll('a').length) {
    require.ensure([],() = >{
        const Button = require('./Components/Button').default;
        const button = new Button('google.com -1111');
 
        button.render('a');
    });
}