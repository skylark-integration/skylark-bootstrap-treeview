/**
 * skylark-bootstrap-treeview - A version of bootstrap treeview that ported to running on skylarkjs ui.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-bootstrap-treeview/
 * @license MIT
 */
define(["skylark-langx/skylark","skylark-langx/langx","skylark-domx-query","skylark-utils-dom/plugins","skylark-widgets-base/Widget"],function(e,t,s,n,i){"use strict";var o=i.inherit({klassName:"TreeView",pluginName:"treeview",widgetClass:"treeview",options:{multiSelect:!1,multiTier:{nest:!0,levels:2,selectors:{children:".list-group.children"},classes:{expandIcon:"glyphicon glyphicon-plus",collapseIcon:"glyphicon glyphicon-minus",children:"list-group children"}},selectors:{item:".list-group-item",children:".list-group"},injectStyle:!0,emptyIcon:"glyphicon",nodeIcon:"",selectedIcon:"",checkedIcon:"glyphicon glyphicon-check",uncheckedIcon:"glyphicon glyphicon-unchecked",colors:{normal:void 0,normalBack:void 0,border:void 0,onhover:"#F5F5F5",selected:"#FFFFFF",selectedBack:"#428bca",searchResult:"#D9534F",searchResultBack:void 0},enableLinks:!1,highlightSelected:!0,highlightSearchResults:!0,showBorder:!0,showIcon:!0,showCheckbox:!1,showTags:!1,search:{ignoreCase:!0,exactMatch:!1,revealResults:!0},noding:{silent:!1,ignoreChildren:!1},templates:{list:'<ul class="list-group"></ul>',item:'<li class="list-group-item"></li>',indent:'<span class="indent"></span>',icon:'<span class="icon"></span>',link:'<a href="#" style="color:inherit;"></a>',badge:'<span class="badge"></span>'},onNodeChecked:void 0,onNodeCollapsed:void 0,onNodeDisabled:void 0,onNodeEnabled:void 0,onNodeExpanded:void 0,onNodeSelected:void 0,onNodeUnchecked:void 0,onNodeUnselected:void 0,onSearchComplete:void 0,onSearchCleared:void 0},css:".Tree .list-group-item{cursor:pointer}.Tree span.indent{margin-left:10px;margin-right:10px}.Tree span.icon{width:12px;margin-right:5px}.Tree .node-disabled{color:silver;cursor:not-allowed}",_init:function(){var e=this.options,n=this._elm;this.$element=s(n),this.elementId=n.id,this.styleId=this.elementId+"-style",this.tree=[],this.nodes=[],e.data&&("string"==typeof e.data&&(e.data=JSON.parse(e.data)),this.tree=t.extend(!0,[],e.data)),this.destroy(),this.subscribeEvents(),this.setInitialStates({nodes:this.tree},0),this.render()},reset:function(e){return t.mixin(this.options,e),this._init()},remove:function(){this.destroy(),datax.removeData(this,this.pluginName),s("#"+this.styleId).remove()},destroy:function(){this.initialized&&(this.$wrapper.remove(),this.$wrapper=null,this.unsubscribeEvents(),this.initialized=!1)},unsubscribeEvents:function(){this.$element.off("click"),this.$element.off("nodeChecked"),this.$element.off("nodeCollapsed"),this.$element.off("nodeDisabled"),this.$element.off("nodeEnabled"),this.$element.off("nodeExpanded"),this.$element.off("nodeSelected"),this.$element.off("nodeUnchecked"),this.$element.off("nodeUnselected"),this.$element.off("searchComplete"),this.$element.off("searchCleared")},subscribeEvents:function(){this.unsubscribeEvents(),this.$element.on("click",t.proxy(this.clickHandler,this)),"function"==typeof this.options.onNodeChecked&&this.$element.on("nodeChecked",this.options.onNodeChecked),"function"==typeof this.options.onNodeCollapsed&&this.$element.on("nodeCollapsed",this.options.onNodeCollapsed),"function"==typeof this.options.onNodeDisabled&&this.$element.on("nodeDisabled",this.options.onNodeDisabled),"function"==typeof this.options.onNodeEnabled&&this.$element.on("nodeEnabled",this.options.onNodeEnabled),"function"==typeof this.options.onNodeExpanded&&this.$element.on("nodeExpanded",this.options.onNodeExpanded),"function"==typeof this.options.onNodeSelected&&this.$element.on("nodeSelected",this.options.onNodeSelected),"function"==typeof this.options.onNodeUnchecked&&this.$element.on("nodeUnchecked",this.options.onNodeUnchecked),"function"==typeof this.options.onNodeUnselected&&this.$element.on("nodeUnselected",this.options.onNodeUnselected),"function"==typeof this.options.onSearchComplete&&this.$element.on("searchComplete",this.options.onSearchComplete),"function"==typeof this.options.onSearchCleared&&this.$element.on("searchCleared",this.options.onSearchCleared)},setInitialStates:function(e,s){if(e.nodes){s+=1;var n=e,i=this;t.each(e.nodes,function(e,t){t.nodeId=i.nodes.length,t.parentId=n.nodeId,t.hasOwnProperty("selectable")||(t.selectable=!0),t.state=t.state||{},t.state.hasOwnProperty("checked")||(t.state.checked=!1),t.state.hasOwnProperty("disabled")||(t.state.disabled=!1),t.state.hasOwnProperty("expanded")||(!t.state.disabled&&s<i.options.multiTier.levels&&t.nodes&&t.nodes.length>0?t.state.expanded=!0:t.state.expanded=!1),t.state.hasOwnProperty("selected")||(t.state.selected=!1),i.nodes.push(t),t.nodes&&i.setInitialStates(t,s)})}},clickHandler:function(e){this.options.enableLinks||e.preventDefault();var t=s(e.target),n=this.findNode(t);if(n&&!n.state.disabled){var i=t.attr("class")?t.attr("class").split(" "):[];-1!==i.indexOf("expand-icon")?(this.toggleExpandedState(n,this.options.noding),this.render()):-1!==i.indexOf("check-icon")?(this.toggleCheckedState(n,this.options.noding),this.render()):(n.selectable?this.toggleSelectedState(n,this.options.noding):this.toggleExpandedState(n,this.options.noding),this.render())}},findNode:function(e){var t=e.closest(this.options.selectors.item).attr("data-nodeid"),s=this.nodes[t];return s||console.log("Error: node does not exist"),s},toggleExpandedState:function(e,t){e&&this.setExpandedState(e,!e.state.expanded,t)},setExpandedState:function(e,s,n){s!==e.state.expanded&&(s&&e.nodes?(e.state.expanded=!0,n.silent||this.$element.trigger("nodeExpanded",t.extend(!0,{},e))):s||(e.state.expanded=!1,n.silent||this.$element.trigger("nodeCollapsed",t.extend(!0,{},e)),e.nodes&&!n.ignoreChildren&&t.each(e.nodes,t.proxy(function(e,t){this.setExpandedState(t,!1,n)},this))))},toggleSelectedState:function(e,t){e&&this.setSelectedState(e,!e.state.selected,t)},setSelectedState:function(e,s,n){s!==e.state.selected&&(s?(this.options.multiSelect||t.each(this.findNodes("true","g","state.selected"),t.proxy(function(e,t){this.setSelectedState(t,!1,n)},this)),e.state.selected=!0,n.silent||this.$element.trigger("nodeSelected",t.extend(!0,{},e))):(e.state.selected=!1,n.silent||this.$element.trigger("nodeUnselected",t.extend(!0,{},e))))},toggleCheckedState:function(e,t){e&&this.setCheckedState(e,!e.state.checked,t)},setCheckedState:function(e,s,n){s!==e.state.checked&&(s?(e.state.checked=!0,n.silent||this.$element.trigger("nodeChecked",t.extend(!0,{},e))):(e.state.checked=!1,n.silent||this.$element.trigger("nodeUnchecked",t.extend(!0,{},e))))},setDisabledState:function(e,s,n){s!==e.state.disabled&&(s?(e.state.disabled=!0,this.setExpandedState(e,!1,n),this.setSelectedState(e,!1,n),this.setCheckedState(e,!1,n),n.silent||this.$element.trigger("nodeDisabled",t.extend(!0,{},e))):(e.state.disabled=!1,n.silent||this.$element.trigger("nodeEnabled",t.extend(!0,{},e))))},render:function(){this.initialized||(this.$element.addClass(this.widgetClass),this.$wrapper=s(this.options.templates.list),this.injectStyle(),this.initialized=!0),this.$element.empty().append(this.$wrapper.empty()),this.buildTree(this.tree,0)},buildTree:function(e,n){if(e){n+=1;var i=this;t.each(e,function(e,o){for(var d=s(i.options.templates.item).addClass("node-"+i.elementId).addClass(o.state.checked?"node-checked":"").addClass(o.state.disabled?"node-disabled":"").addClass(o.state.selected?"node-selected":"").addClass(o.searchResult?"search-result":"").attr("data-nodeid",o.nodeId).attr("style",i.buildStyleOverride(o)),a=0;a<n-1;a++)d.append(i.options.templates.indent);var r=[];(o.nodes?(r.push("expand-icon"),o.state.expanded?r.push(i.options.multiTier.classes.collapseIcon):r.push(i.options.multiTier.classes.expandIcon)):r.push(i.options.emptyIcon),d.append(s(i.options.templates.icon).addClass(r.join(" "))),i.options.showIcon)&&((r=["node-icon"]).push(o.icon||i.options.nodeIcon),o.state.selected&&(r.pop(),r.push(o.selectedIcon||i.options.selectedIcon||o.icon||i.options.nodeIcon)),d.append(s(i.options.templates.icon).addClass(r.join(" "))));if(i.options.showCheckbox){r=["check-icon"];o.state.checked?r.push(i.options.checkedIcon):r.push(i.options.uncheckedIcon),d.append(s(i.options.templates.icon).addClass(r.join(" ")))}if(i.options.enableLinks?d.append(s(i.options.templates.link).attr("href",o.href).append(o.text)):d.append(o.text),i.options.showTags&&o.tags&&t.each(o.tags,function(e,t){d.append(s(i.options.templates.badge).append(t))}),i.$wrapper.append(d),o.nodes&&o.state.expanded&&!o.state.disabled)return i.buildTree(o.nodes,n,d)})}},buildStyleOverride:function(e){if(e.state.disabled)return"";var t=e.color,s=e.backColor;return this.options.highlightSelected&&e.state.selected&&(this.options.colors.selected&&(t=this.options.colors.selected),this.options.colors.selectedBack&&(s=this.options.colors.selectedBack)),this.options.highlightSearchResults&&e.searchResult&&!e.state.disabled&&(this.options.colors.searchResult&&(t=this.options.colors.searchResult),this.options.colors.searchResultBack&&(s=this.options.colors.searchResultBack)),"color:"+t+";background-color:"+s+";"},injectStyle:function(){this.options.injectStyle&&!document.getElementById(this.styleId)&&s('<style type="text/css" id="'+this.styleId+'"> '+this.buildStyle()+" </style>").appendTo("head")},buildStyle:function(){var e=".node-"+this.elementId+"{";return this.options.colors.normal&&(e+="color:"+this.options.colors.normal+";"),this.options.colors.normalBack&&(e+="background-color:"+this.options.colors.normalBack+";"),this.options.showBorder?this.options.colors.border&&(e+="border:1px solid "+this.options.colors.border+";"):e+="border:none;",e+="}",this.options.colors.onhover&&(e+=".node-"+this.elementId+":not(.node-disabled):hover{background-color:"+this.options.colors.onhover+";}"),this.css+e},getNode:function(e){return this.nodes[e]},getParent:function(e){var t=this.identifyNode(e);return this.nodes[t.parentId]},getSiblings:function(e){var t=this.identifyNode(e),s=this.getParent(t);return(s?s.nodes:this.tree).filter(function(e){return e.nodeId!==t.nodeId})},getSelected:function(){return this.findNodes("true","g","state.selected")},getUnselected:function(){return this.findNodes("false","g","state.selected")},getExpanded:function(){return this.findNodes("true","g","state.expanded")},getCollapsed:function(){return this.findNodes("false","g","state.expanded")},getChecked:function(){return this.findNodes("true","g","state.checked")},getUnchecked:function(){return this.findNodes("false","g","state.checked")},getDisabled:function(){return this.findNodes("true","g","state.disabled")},getEnabled:function(){return this.findNodes("false","g","state.disabled")},selectNode:function(e,s){this.forEachIdentifier(e,s,t.proxy(function(e,t){this.setSelectedState(e,!0,t)},this)),this.render()},unselectNode:function(e,s){this.forEachIdentifier(e,s,t.proxy(function(e,t){this.setSelectedState(e,!1,t)},this)),this.render()},toggleNodeSelected:function(e,s){this.forEachIdentifier(e,s,t.proxy(function(e,t){this.toggleSelectedState(e,t)},this)),this.render()},collapseAll:function(e){var s=this.findNodes("true","g","state.expanded");this.forEachIdentifier(s,e,t.proxy(function(e,t){this.setExpandedState(e,!1,t)},this)),this.render()},collapseNode:function(e,s){this.forEachIdentifier(e,s,t.proxy(function(e,t){this.setExpandedState(e,!1,t)},this)),this.render()},expandAll:function(e){if((e=t.extend({},this.options.noding,e))&&e.levels)this.expandLevels(this.tree,e.levels,e);else{var s=this.findNodes("false","g","state.expanded");this.forEachIdentifier(s,e,t.proxy(function(e,t){this.setExpandedState(e,!0,t)},this))}this.render()},expandNode:function(e,s){this.forEachIdentifier(e,s,t.proxy(function(e,t){this.setExpandedState(e,!0,t),e.nodes&&t&&t.levels&&this.expandLevels(e.nodes,t.levels-1,t)},this)),this.render()},expandLevels:function(e,s,n){n=t.extend({},this.options.noding,n),t.each(e,t.proxy(function(e,t){this.setExpandedState(t,s>0,n),t.nodes&&this.expandLevels(t.nodes,s-1,n)},this))},revealNode:function(e,s){this.forEachIdentifier(e,s,t.proxy(function(e,t){for(var s=this.getParent(e);s;)this.setExpandedState(s,!0,t),s=this.getParent(s)},this)),this.render()},toggleNodeExpanded:function(e,s){this.forEachIdentifier(e,s,t.proxy(function(e,t){this.toggleExpandedState(e,t)},this)),this.render()},checkAll:function(e){var s=this.findNodes("false","g","state.checked");this.forEachIdentifier(s,e,t.proxy(function(e,t){this.setCheckedState(e,!0,t)},this)),this.render()},checkNode:function(e,s){this.forEachIdentifier(e,s,t.proxy(function(e,t){this.setCheckedState(e,!0,t)},this)),this.render()},uncheckAll:function(e){var s=this.findNodes("true","g","state.checked");this.forEachIdentifier(s,e,t.proxy(function(e,t){this.setCheckedState(e,!1,t)},this)),this.render()},uncheckNode:function(e,s){this.forEachIdentifier(e,s,t.proxy(function(e,t){this.setCheckedState(e,!1,t)},this)),this.render()},toggleNodeChecked:function(e,s){this.forEachIdentifier(e,s,t.proxy(function(e,t){this.toggleCheckedState(e,t)},this)),this.render()},disableAll:function(e){var s=this.findNodes("false","g","state.disabled");this.forEachIdentifier(s,e,t.proxy(function(e,t){this.setDisabledState(e,!0,t)},this)),this.render()},disableNode:function(e,s){this.forEachIdentifier(e,s,t.proxy(function(e,t){this.setDisabledState(e,!0,t)},this)),this.render()},enableAll:function(e){var s=this.findNodes("true","g","state.disabled");this.forEachIdentifier(s,e,t.proxy(function(e,t){this.setDisabledState(e,!1,t)},this)),this.render()},enableNode:function(e,s){this.forEachIdentifier(e,s,t.proxy(function(e,t){this.setDisabledState(e,!1,t)},this)),this.render()},toggleNodeDisabled:function(e,s){this.forEachIdentifier(e,s,t.proxy(function(e,t){this.setDisabledState(e,!e.state.disabled,t)},this)),this.render()},forEachIdentifier:function(e,s,n){s=t.extend({},this.options.noding,s),e instanceof Array||(e=[e]),t.each(e,t.proxy(function(e,t){n(this.identifyNode(t),s)},this))},identifyNode:function(e){return"number"==typeof e?this.nodes[e]:e},search:function(e,s){s=t.extend({},this.options.search,s),this.clearSearch({render:!1});var n=[];if(e&&e.length>0){s.exactMatch&&(e="^"+e+"$");var i="g";s.ignoreCase&&(i+="i"),n=this.findNodes(e,i),t.each(n,function(e,t){t.searchResult=!0})}return s.revealResults?this.revealNode(n):this.render(),this.$element.trigger("searchComplete",t.extend(!0,{},n)),n},clearSearch:function(e){e=t.extend({},{render:!0},e);var s=t.each(this.findNodes("true","g","searchResult"),function(e,t){t.searchResult=!1});e.render&&this.render(),this.$element.trigger("searchCleared",t.extend(!0,{},s))},findNodes:function(e,s,n){s=s||"g",n=n||"text";var i=this;return t.grep(this.nodes,function(t){var o=i.getNodeValue(t,n);if("string"==typeof o)return o.match(new RegExp(e,s))})},getNodeValue:function(e,t){var s=t.indexOf(".");if(s>0){var n=e[t.substring(0,s)],i=t.substring(s+1,t.length);return this.getNodeValue(n,i)}return e.hasOwnProperty(t)?e[t].toString():void 0}});return n.register(o,"treeview",function(e,t){return"string"==typeof e?(t instanceof Array||(t=[t]),this[e].apply(this,t)):"boolean"==typeof e?this:void this.reset(e)}),o});
//# sourceMappingURL=sourcemaps/TreeView.js.map
