(function(){
	module.config({
		require:true,//default false
		base:'/static/js/',
        //nocache:true,
		mined:'',
        dirs:{},
        alias:{
            'jquery.module':'{pm.modules}/jquery.module',
            /** pm ui start */
            'ui.tab':'{pm.ui}/ui.tab',
            'ui.dialog':'{pm.ui}/ui.dialog',
            'ui.dropdown':'{pm.ui}/ui.dropdown',
            'ui.selectbox':'{pm.ui}/ui.selectbox',
            'ui.pagination':'{pm.ui}/ui.pagination',
            'ui.toast':'{pm.ui}/ui.toast',
            /** pm ui end */
            /** pm plugins/modules start */
            'db':'{pm.plugins}/db',
            'os':'{pm.plugins}/os',
            'validator.fields':'{pm.plugins}/validator.fields',
            //'jquery.flexslider':'{pm.modules}/jquery.flexslider.module',
            'jquery-ui.module':'{pm.modules}/jquery-ui.module',
            'swiper.module':'{pm.modules}/swiper.module',
            /** pm plugins/modules end */

            //
            'page.home':'{pages}/home',

            /** pm core start */
            'pm':'{pm.core}/pm',
            'pm.ajax':'{pm.core}/pm.ajax',
            'pm.config':'pm.config',
            'pm.dataset':'{pm.core}/pm.dataset',
            'pm.view':'{pm.core}/pm.view',
            'pm.analytics':'{pm.core}/pm.analytics',
            /** pm core test end */

            /** pm mobile start */
            'pm.mobi':'{pm.mobi}/pm.mobi'
            /** pm mobile end */
        },
        files:[],
        globals:{
            '$':'jquery.module'
        },
		debug:false
	});
})();