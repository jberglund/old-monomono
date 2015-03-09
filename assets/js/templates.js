this["Marmelad"] = this["Marmelad"] || {};
this["Marmelad"]["templates"] = this["Marmelad"]["templates"] || {};
this["Marmelad"]["templates"]["searchtrack"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, lambda=this.lambda;
  return "\n<div class=\"track__inner\">\n    <div class=\"track__assets\">\n    <img class=\"track__img\" src=\""
    + escapeExpression(((helper = (helper = helpers.artwork_url || (depth0 != null ? depth0.artwork_url : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"artwork_url","hash":{},"data":data}) : helper)))
    + "\"/>\n    <span class=\"track__added-icon\">\n        <svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 287.6 197.8\">\n            <path fill=\"#52A03A\" d=\"M135.9,189.9c-5.3,5.3-12.2,7.9-19.1,7.9s-13.8-2.6-19.1-7.9\n                l-90-90C2.2,94.3-0.3,87,0,79.7c0.3-6.5,2.7-13,7.7-18c5-5,11.5-7.4,18-7.7c7.3-0.3,14.6,2.1,20.2,7.7l70.9,70.9L241.7,7.7\n                c5.6-5.6,12.9-8,20.2-7.7c6.5,0.3,13,2.7,18,7.7c5,5,7.4,11.5,7.7,18c0.3,7.3-2.1,14.6-7.7,20.2L135.9,189.9z\"/>\n        </svg>\n    </span>\n    </div>\n    <div class=\"track__info\" data-id=\""
    + escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"id","hash":{},"data":data}) : helper)))
    + "\">\n        <h4 class=\"track__title\">"
    + escapeExpression(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"title","hash":{},"data":data}) : helper)))
    + " <small>("
    + escapeExpression(lambda(((stack1 = (depth0 != null ? depth0.addedBy : depth0)) != null ? stack1.name : stack1), depth0))
    + ")</small></h4>\n        <div class=\"track__username\">"
    + escapeExpression(lambda(((stack1 = (depth0 != null ? depth0.user : depth0)) != null ? stack1.username : stack1), depth0))
    + "</div>\n        <div class=\"track__duration\">"
    + escapeExpression(((helper = (helper = helpers.prettyDuration || (depth0 != null ? depth0.prettyDuration : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"prettyDuration","hash":{},"data":data}) : helper)))
    + "</div>\n        <div class=\"track__delete js-delete\">Del</div>\n    </div>\n    <div class=\"track__seek\">\n        <span class=\"track__seek__indicator\"></span>\n    </div>\n</div>\n";
},"useData":true});