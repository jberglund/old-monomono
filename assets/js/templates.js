this["Marmelad"] = this["Marmelad"] || {};
this["Marmelad"]["templates"] = this["Marmelad"]["templates"] || {};
this["Marmelad"]["templates"]["searchtrack"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, lambda=this.lambda;
  return "<div class=\"track__inner\">\n    <img class=\"track__img\" src=\""
    + escapeExpression(((helper = (helper = helpers.artwork_url || (depth0 != null ? depth0.artwork_url : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"artwork_url","hash":{},"data":data}) : helper)))
    + "\"/>\n    <div class=\"track__info\">\n    	<div class=\"va\">\n	    	<h4 class=\"track__title\">"
    + escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + "</h4>\n	    	<h4 class=\"track__username\">"
    + escapeExpression(lambda(((stack1 = (depth0 != null ? depth0.user : depth0)) != null ? stack1.username : stack1), depth0))
    + "</h4>\n            <h4 class=\"track__played\"><span></span></h4>\n    	</div>\n    </div>\n</div>\n";
},"useData":true});