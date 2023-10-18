(function(){
	module.config({
		require:true,//default false
		base:'/js/',
        nocache:true,
		mined:'',
        dirs:{},
        alias:{
            'zepto.module':'{pm.modules}/zepto.module',
            'flickable.module':'{pm.modules}/flickable.module',
            'jquery.flexslider':'{pm.modules}/jquery.flexslider.module',
            /** pm ui start */
            'ui.tab':'{pm.ui}/ui.tab',
            'ui.dialog':'{pm.ui}/ui.dialog',
            'ui.dropdown':'{pm.ui}/ui.dropdown',
            'ui.pagination':'{pm.ui}/ui.pagination',
            /** pm ui end */
            /** pm plugins/modules start */
            'os':'{pm.plugins}/os',
            'touchevent':'{pm.plugins}/touchevent',
            /** pm plugins/modules end */

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
            '$':'zepto.module'
        },
		debug:false
	});
})();