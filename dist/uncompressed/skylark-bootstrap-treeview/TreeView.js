define([
	"skylark-langx/skylark",
	"skylark-langx/langx",
	"skylark-domx-query",
  	"skylark-utils-dom/plugins"
], function(skylark,langx,$,plugins) {

	/*global jQuery, console*/

	'use strict';


	var pluginName = 'treeview';

	var _default = {};

	_default.settings = {

		injectStyle: true,

		levels: 2,

		expandIcon: 'glyphicon glyphicon-plus',
		collapseIcon: 'glyphicon glyphicon-minus',
		emptyIcon: 'glyphicon',
		nodeIcon: '',
		selectedIcon: '',
		checkedIcon: 'glyphicon glyphicon-check',
		uncheckedIcon: 'glyphicon glyphicon-unchecked',

		color: undefined, // '#000000',
		backColor: undefined, // '#FFFFFF',
		borderColor: undefined, // '#dddddd',
		onhoverColor: '#F5F5F5',
		selectedColor: '#FFFFFF',
		selectedBackColor: '#428bca',
		searchResultColor: '#D9534F',
		searchResultBackColor: undefined, //'#FFFFFF',

		enableLinks: false,
		highlightSelected: true,
		highlightSearchResults: true,
		showBorder: true,
		showIcon: true,
		showCheckbox: false,
		showTags: false,
		multiSelect: false,

		// Event handlers
		onNodeChecked: undefined,
		onNodeCollapsed: undefined,
		onNodeDisabled: undefined,
		onNodeEnabled: undefined,
		onNodeExpanded: undefined,
		onNodeSelected: undefined,
		onNodeUnchecked: undefined,
		onNodeUnselected: undefined,
		onSearchComplete: undefined,
		onSearchCleared: undefined
	};

	_default.options = {
		silent: false,
		ignoreChildren: false
	};

	_default.searchOptions = {
		ignoreCase: true,
		exactMatch: false,
		revealResults: true
	};

	var TreeView =  plugins.Plugin.inherit({
		klassName: "TreeView",

		pluginName : "bs3.TreeView",

		template : {
			list: '<ul class="list-group"></ul>',
			item: '<li class="list-group-item"></li>',
			indent: '<span class="indent"></span>',
			icon: '<span class="icon"></span>',
			link: '<a href="#" style="color:inherit;"></a>',
			badge: '<span class="badge"></span>'
		},

		css : '.treeview .list-group-item{cursor:pointer}.treeview span.indent{margin-left:10px;margin-right:10px}.treeview span.icon{width:12px;margin-right:5px}.treeview .node-disabled{color:silver;cursor:not-allowed}' ,

		_construct : function (element, options) {

			this.$element = $(element);
			this.elementId = element.id;
			this.styleId = this.elementId + '-style';

			this.init(options);

			return {

				// Options (public access)
				options: this.options,

				// Initialize / destroy methods
				init: langx.proxy(this.init, this),
				remove: langx.proxy(this.remove, this),

				// Get methods
				getNode: langx.proxy(this.getNode, this),
				getParent: langx.proxy(this.getParent, this),
				getSiblings: langx.proxy(this.getSiblings, this),
				getSelected: langx.proxy(this.getSelected, this),
				getUnselected: langx.proxy(this.getUnselected, this),
				getExpanded: langx.proxy(this.getExpanded, this),
				getCollapsed: langx.proxy(this.getCollapsed, this),
				getChecked: langx.proxy(this.getChecked, this),
				getUnchecked: langx.proxy(this.getUnchecked, this),
				getDisabled: langx.proxy(this.getDisabled, this),
				getEnabled: langx.proxy(this.getEnabled, this),

				// Select methods
				selectNode: langx.proxy(this.selectNode, this),
				unselectNode: langx.proxy(this.unselectNode, this),
				toggleNodeSelected: langx.proxy(this.toggleNodeSelected, this),

				// Expand / collapse methods
				collapseAll: langx.proxy(this.collapseAll, this),
				collapseNode: langx.proxy(this.collapseNode, this),
				expandAll: langx.proxy(this.expandAll, this),
				expandNode: langx.proxy(this.expandNode, this),
				toggleNodeExpanded: langx.proxy(this.toggleNodeExpanded, this),
				revealNode: langx.proxy(this.revealNode, this),

				// Expand / collapse methods
				checkAll: langx.proxy(this.checkAll, this),
				checkNode: langx.proxy(this.checkNode, this),
				uncheckAll: langx.proxy(this.uncheckAll, this),
				uncheckNode: langx.proxy(this.uncheckNode, this),
				toggleNodeChecked: langx.proxy(this.toggleNodeChecked, this),

				// Disable / enable methods
				disableAll: langx.proxy(this.disableAll, this),
				disableNode: langx.proxy(this.disableNode, this),
				enableAll: langx.proxy(this.enableAll, this),
				enableNode: langx.proxy(this.enableNode, this),
				toggleNodeDisabled: langx.proxy(this.toggleNodeDisabled, this),

				// Search methods
				search: langx.proxy(this.search, this),
				clearSearch: langx.proxy(this.clearSearch, this)
			};
		},

		init : function (options) {

			this.tree = [];
			this.nodes = [];

			if (options.data) {
				if (typeof options.data === 'string') {
					options.data = langx.parseJSON(options.data);
				}
				this.tree = langx.extend(true, [], options.data);
				delete options.data;
			}
			this.options = langx.extend({}, _default.settings, options);

			this.destroy();
			this.subscribeEvents();
			this.setInitialStates({ nodes: this.tree }, 0);
			this.render();
		},

		remove : function () {
			this.destroy();
			datax.removeData(this, pluginName);
			$('#' + this.styleId).remove();
		},

		destroy : function () {

			if (!this.initialized) return;

			this.$wrapper.remove();
			this.$wrapper = null;

			// Switch off events
			this.unsubscribeEvents();

			// Reset this.initialized flag
			this.initialized = false;
		},

		unsubscribeEvents : function () {

			this.$element.off('click');
			this.$element.off('nodeChecked');
			this.$element.off('nodeCollapsed');
			this.$element.off('nodeDisabled');
			this.$element.off('nodeEnabled');
			this.$element.off('nodeExpanded');
			this.$element.off('nodeSelected');
			this.$element.off('nodeUnchecked');
			this.$element.off('nodeUnselected');
			this.$element.off('searchComplete');
			this.$element.off('searchCleared');
		},

		subscribeEvents : function () {

			this.unsubscribeEvents();

			this.$element.on('click', langx.proxy(this.clickHandler, this));

			if (typeof (this.options.onNodeChecked) === 'function') {
				this.$element.on('nodeChecked', this.options.onNodeChecked);
			}

			if (typeof (this.options.onNodeCollapsed) === 'function') {
				this.$element.on('nodeCollapsed', this.options.onNodeCollapsed);
			}

			if (typeof (this.options.onNodeDisabled) === 'function') {
				this.$element.on('nodeDisabled', this.options.onNodeDisabled);
			}

			if (typeof (this.options.onNodeEnabled) === 'function') {
				this.$element.on('nodeEnabled', this.options.onNodeEnabled);
			}

			if (typeof (this.options.onNodeExpanded) === 'function') {
				this.$element.on('nodeExpanded', this.options.onNodeExpanded);
			}

			if (typeof (this.options.onNodeSelected) === 'function') {
				this.$element.on('nodeSelected', this.options.onNodeSelected);
			}

			if (typeof (this.options.onNodeUnchecked) === 'function') {
				this.$element.on('nodeUnchecked', this.options.onNodeUnchecked);
			}

			if (typeof (this.options.onNodeUnselected) === 'function') {
				this.$element.on('nodeUnselected', this.options.onNodeUnselected);
			}

			if (typeof (this.options.onSearchComplete) === 'function') {
				this.$element.on('searchComplete', this.options.onSearchComplete);
			}

			if (typeof (this.options.onSearchCleared) === 'function') {
				this.$element.on('searchCleared', this.options.onSearchCleared);
			}
		},

		/*
			Recurse the tree structure and ensure all nodes have
			valid initial states.  User defined states will be preserved.
			For performance we also take this opportunity to
			index nodes in a flattened structure
		*/
		setInitialStates : function (node, level) {

			if (!node.nodes) return;
			level += 1;

			var parent = node;
			var _this = this;
			langx.each(node.nodes, function checkStates(index, node) {

				// nodeId : unique, incremental identifier
				node.nodeId = _this.nodes.length;

				// parentId : transversing up the tree
				node.parentId = parent.nodeId;

				// if not provided set selectable default value
				if (!node.hasOwnProperty('selectable')) {
					node.selectable = true;
				}

				// where provided we should preserve states
				node.state = node.state || {};

				// set checked state; unless set always false
				if (!node.state.hasOwnProperty('checked')) {
					node.state.checked = false;
				}

				// set enabled state; unless set always false
				if (!node.state.hasOwnProperty('disabled')) {
					node.state.disabled = false;
				}

				// set expanded state; if not provided based on levels
				if (!node.state.hasOwnProperty('expanded')) {
					if (!node.state.disabled &&
							(level < _this.options.levels) &&
							(node.nodes && node.nodes.length > 0)) {
						node.state.expanded = true;
					}
					else {
						node.state.expanded = false;
					}
				}

				// set selected state; unless set always false
				if (!node.state.hasOwnProperty('selected')) {
					node.state.selected = false;
				}

				// index nodes in a flattened structure for use later
				_this.nodes.push(node);

				// recurse child nodes and transverse the tree
				if (node.nodes) {
					_this.setInitialStates(node, level);
				}
			});
		},

		clickHandler : function (event) {

			if (!this.options.enableLinks) event.preventDefault();

			var target = $(event.target);
			var node = this.findNode(target);
			if (!node || node.state.disabled) return;
			
			var classList = target.attr('class') ? target.attr('class').split(' ') : [];
			if ((classList.indexOf('expand-icon') !== -1)) {

				this.toggleExpandedState(node, _default.options);
				this.render();
			}
			else if ((classList.indexOf('check-icon') !== -1)) {
				
				this.toggleCheckedState(node, _default.options);
				this.render();
			}
			else {
				
				if (node.selectable) {
					this.toggleSelectedState(node, _default.options);
				} else {
					this.toggleExpandedState(node, _default.options);
				}

				this.render();
			}
		},

		// Looks up the DOM for the closest parent list item to retrieve the
		// data attribute nodeid, which is used to lookup the node in the flattened structure.
		findNode : function (target) {

			var nodeId = target.closest('li.list-group-item').attr('data-nodeid');
			var node = this.nodes[nodeId];

			if (!node) {
				console.log('Error: node does not exist');
			}
			return node;
		},

		toggleExpandedState : function (node, options) {
			if (!node) return;
			this.setExpandedState(node, !node.state.expanded, options);
		},

		setExpandedState : function (node, state, options) {

			if (state === node.state.expanded) return;

			if (state && node.nodes) {

				// Expand a node
				node.state.expanded = true;
				if (!options.silent) {
					this.$element.trigger('nodeExpanded', langx.extend(true, {}, node));
				}
			}
			else if (!state) {

				// Collapse a node
				node.state.expanded = false;
				if (!options.silent) {
					this.$element.trigger('nodeCollapsed', langx.extend(true, {}, node));
				}

				// Collapse child nodes
				if (node.nodes && !options.ignoreChildren) {
					langx.each(node.nodes, langx.proxy(function (index, node) {
						this.setExpandedState(node, false, options);
					}, this));
				}
			}
		},

		toggleSelectedState : function (node, options) {
			if (!node) return;
			this.setSelectedState(node, !node.state.selected, options);
		},

		setSelectedState : function (node, state, options) {

			if (state === node.state.selected) return;

			if (state) {

				// If multiSelect false, unselect previously selected
				if (!this.options.multiSelect) {
					langx.each(this.findNodes('true', 'g', 'state.selected'), langx.proxy(function (index, node) {
						this.setSelectedState(node, false, options);
					}, this));
				}

				// Continue selecting node
				node.state.selected = true;
				if (!options.silent) {
					this.$element.trigger('nodeSelected', langx.extend(true, {}, node));
				}
			}
			else {

				// Unselect node
				node.state.selected = false;
				if (!options.silent) {
					this.$element.trigger('nodeUnselected', langx.extend(true, {}, node));
				}
			}
		},

		toggleCheckedState : function (node, options) {
			if (!node) return;
			this.setCheckedState(node, !node.state.checked, options);
		},

		setCheckedState : function (node, state, options) {

			if (state === node.state.checked) return;

			if (state) {

				// Check node
				node.state.checked = true;

				if (!options.silent) {
					this.$element.trigger('nodeChecked', langx.extend(true, {}, node));
				}
			}
			else {

				// Uncheck node
				node.state.checked = false;
				if (!options.silent) {
					this.$element.trigger('nodeUnchecked', langx.extend(true, {}, node));
				}
			}
		},

		setDisabledState : function (node, state, options) {

			if (state === node.state.disabled) return;

			if (state) {

				// Disable node
				node.state.disabled = true;

				// Disable all other states
				this.setExpandedState(node, false, options);
				this.setSelectedState(node, false, options);
				this.setCheckedState(node, false, options);

				if (!options.silent) {
					this.$element.trigger('nodeDisabled', langx.extend(true, {}, node));
				}
			}
			else {

				// Enabled node
				node.state.disabled = false;
				if (!options.silent) {
					this.$element.trigger('nodeEnabled', langx.extend(true, {}, node));
				}
			}
		},

		render : function () {

			if (!this.initialized) {

				// Setup first time only components
				this.$element.addClass(pluginName);
				this.$wrapper = $(this.template.list);

				this.injectStyle();

				this.initialized = true;
			}

			this.$element.empty().append(this.$wrapper.empty());

			// Build tree
			this.buildTree(this.tree, 0);
		},

		// Starting from the root node, and recursing down the
		// structure we build the tree one node at a time
		buildTree : function (nodes, level) {

			if (!nodes) return;
			level += 1;

			var _this = this;
			langx.each(nodes, function addNodes(id, node) {

				var treeItem = $(_this.template.item)
					.addClass('node-' + _this.elementId)
					.addClass(node.state.checked ? 'node-checked' : '')
					.addClass(node.state.disabled ? 'node-disabled': '')
					.addClass(node.state.selected ? 'node-selected' : '')
					.addClass(node.searchResult ? 'search-result' : '') 
					.attr('data-nodeid', node.nodeId)
					.attr('style', _this.buildStyleOverride(node));

				// Add indent/spacer to mimic tree structure
				for (var i = 0; i < (level - 1); i++) {
					treeItem.append(_this.template.indent);
				}

				// Add expand, collapse or empty spacer icons
				var classList = [];
				if (node.nodes) {
					classList.push('expand-icon');
					if (node.state.expanded) {
						classList.push(_this.options.collapseIcon);
					}
					else {
						classList.push(_this.options.expandIcon);
					}
				}
				else {
					classList.push(_this.options.emptyIcon);
				}

				treeItem
					.append($(_this.template.icon)
						.addClass(classList.join(' '))
					);


				// Add node icon
				if (_this.options.showIcon) {
					
					var classList = ['node-icon'];

					classList.push(node.icon || _this.options.nodeIcon);
					if (node.state.selected) {
						classList.pop();
						classList.push(node.selectedIcon || _this.options.selectedIcon || 
										node.icon || _this.options.nodeIcon);
					}

					treeItem
						.append($(_this.template.icon)
							.addClass(classList.join(' '))
						);
				}

				// Add check / unchecked icon
				if (_this.options.showCheckbox) {

					var classList = ['check-icon'];
					if (node.state.checked) {
						classList.push(_this.options.checkedIcon); 
					}
					else {
						classList.push(_this.options.uncheckedIcon);
					}

					treeItem
						.append($(_this.template.icon)
							.addClass(classList.join(' '))
						);
				}

				// Add text
				if (_this.options.enableLinks) {
					// Add hyperlink
					treeItem
						.append($(_this.template.link)
							.attr('href', node.href)
							.append(node.text)
						);
				}
				else {
					// otherwise just text
					treeItem
						.append(node.text);
				}

				// Add tags as badges
				if (_this.options.showTags && node.tags) {
					langx.each(node.tags, function addTag(id, tag) {
						treeItem
							.append($(_this.template.badge)
								.append(tag)
							);
					});
				}

				// Add item to the tree
				_this.$wrapper.append(treeItem);

				// Recursively add child ndoes
				if (node.nodes && node.state.expanded && !node.state.disabled) {
					return _this.buildTree(node.nodes, level);
				}
			});
		},

		// Define any node level style override for
		// 1. selectedNode
		// 2. node|data assigned color overrides
		buildStyleOverride : function (node) {

			if (node.state.disabled) return '';

			var color = node.color;
			var backColor = node.backColor;

			if (this.options.highlightSelected && node.state.selected) {
				if (this.options.selectedColor) {
					color = this.options.selectedColor;
				}
				if (this.options.selectedBackColor) {
					backColor = this.options.selectedBackColor;
				}
			}

			if (this.options.highlightSearchResults && node.searchResult && !node.state.disabled) {
				if (this.options.searchResultColor) {
					color = this.options.searchResultColor;
				}
				if (this.options.searchResultBackColor) {
					backColor = this.options.searchResultBackColor;
				}
			}

			return 'color:' + color +
				';background-color:' + backColor + ';';
		},

		// Add inline style into head
		injectStyle : function () {

			if (this.options.injectStyle && !document.getElementById(this.styleId)) {
				$('<style type="text/css" id="' + this.styleId + '"> ' + this.buildStyle() + ' </style>').appendTo('head');
			}
		},

		// Construct trees style based on user options
		buildStyle : function () {

			var style = '.node-' + this.elementId + '{';

			if (this.options.color) {
				style += 'color:' + this.options.color + ';';
			}

			if (this.options.backColor) {
				style += 'background-color:' + this.options.backColor + ';';
			}

			if (!this.options.showBorder) {
				style += 'border:none;';
			}
			else if (this.options.borderColor) {
				style += 'border:1px solid ' + this.options.borderColor + ';';
			}
			style += '}';

			if (this.options.onhoverColor) {
				style += '.node-' + this.elementId + ':not(.node-disabled):hover{' +
					'background-color:' + this.options.onhoverColor + ';' +
				'}';
			}

			return this.css + style;
		},

		/**
			Returns a single node object that matches the given node id.
			@param {Number} nodeId - A node's unique identifier
			@return {Object} node - Matching node
		*/
		getNode : function (nodeId) {
			return this.nodes[nodeId];
		},

		/**
			Returns the parent node of a given node, if valid otherwise returns undefined.
			@param {Object|Number} identifier - A valid node or node id
			@returns {Object} node - The parent node
		*/
		getParent : function (identifier) {
			var node = this.identifyNode(identifier);
			return this.nodes[node.parentId];
		},

		/**
			Returns an array of sibling nodes for a given node, if valid otherwise returns undefined.
			@param {Object|Number} identifier - A valid node or node id
			@returns {Array} nodes - Sibling nodes
		*/
		getSiblings : function (identifier) {
			var node = this.identifyNode(identifier);
			var parent = this.getParent(node);
			var nodes = parent ? parent.nodes : this.tree;
			return nodes.filter(function (obj) {
					return obj.nodeId !== node.nodeId;
				});
		},

		/**
			Returns an array of selected nodes.
			@returns {Array} nodes - Selected nodes
		*/
		getSelected : function () {
			return this.findNodes('true', 'g', 'state.selected');
		},

		/**
			Returns an array of unselected nodes.
			@returns {Array} nodes - Unselected nodes
		*/
		getUnselected : function () {
			return this.findNodes('false', 'g', 'state.selected');
		},

		/**
			Returns an array of expanded nodes.
			@returns {Array} nodes - Expanded nodes
		*/
		getExpanded : function () {
			return this.findNodes('true', 'g', 'state.expanded');
		},

		/**
			Returns an array of collapsed nodes.
			@returns {Array} nodes - Collapsed nodes
		*/
		getCollapsed : function () {
			return this.findNodes('false', 'g', 'state.expanded');
		},

		/**
			Returns an array of checked nodes.
			@returns {Array} nodes - Checked nodes
		*/
		getChecked : function () {
			return this.findNodes('true', 'g', 'state.checked');
		},

		/**
			Returns an array of unchecked nodes.
			@returns {Array} nodes - Unchecked nodes
		*/
		getUnchecked : function () {
			return this.findNodes('false', 'g', 'state.checked');
		},

		/**
			Returns an array of disabled nodes.
			@returns {Array} nodes - Disabled nodes
		*/
		getDisabled : function () {
			return this.findNodes('true', 'g', 'state.disabled');
		},

		/**
			Returns an array of enabled nodes.
			@returns {Array} nodes - Enabled nodes
		*/
		getEnabled : function () {
			return this.findNodes('false', 'g', 'state.disabled');
		},


		/**
			Set a node state to selected
			@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
			@param {optional Object} options
		*/
		selectNode : function (identifiers, options) {
			this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
				this.setSelectedState(node, true, options);
			}, this));

			this.render();
		},

		/**
			Set a node state to unselected
			@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
			@param {optional Object} options
		*/
		unselectNode : function (identifiers, options) {
			this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
				this.setSelectedState(node, false, options);
			}, this));

			this.render();
		},

		/**
			Toggles a node selected state; selecting if unselected, unselecting if selected.
			@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
			@param {optional Object} options
		*/
		toggleNodeSelected : function (identifiers, options) {
			this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
				this.toggleSelectedState(node, options);
			}, this));

			this.render();
		},


		/**
			Collapse all tree nodes
			@param {optional Object} options
		*/
		collapseAll : function (options) {
			var identifiers = this.findNodes('true', 'g', 'state.expanded');
			this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
				this.setExpandedState(node, false, options);
			}, this));

			this.render();
		},

		/**
			Collapse a given tree node
			@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
			@param {optional Object} options
		*/
		collapseNode : function (identifiers, options) {
			this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
				this.setExpandedState(node, false, options);
			}, this));

			this.render();
		},

		/**
			Expand all tree nodes
			@param {optional Object} options
		*/
		expandAll : function (options) {
			options = langx.extend({}, _default.options, options);

			if (options && options.levels) {
				this.expandLevels(this.tree, options.levels, options);
			}
			else {
				var identifiers = this.findNodes('false', 'g', 'state.expanded');
				this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
					this.setExpandedState(node, true, options);
				}, this));
			}

			this.render();
		},

		/**
			Expand a given tree node
			@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
			@param {optional Object} options
		*/
		expandNode : function (identifiers, options) {
			this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
				this.setExpandedState(node, true, options);
				if (node.nodes && (options && options.levels)) {
					this.expandLevels(node.nodes, options.levels-1, options);
				}
			}, this));

			this.render();
		},

		expandLevels : function (nodes, level, options) {
			options = langx.extend({}, _default.options, options);

			langx.each(nodes, langx.proxy(function (index, node) {
				this.setExpandedState(node, (level > 0) ? true : false, options);
				if (node.nodes) {
					this.expandLevels(node.nodes, level-1, options);
				}
			}, this));
		},

		/**
			Reveals a given tree node, expanding the tree from node to root.
			@param {Object|Number|Array} identifiers - A valid node, node id or array of node identifiers
			@param {optional Object} options
		*/
		revealNode : function (identifiers, options) {
			this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
				var parentNode = this.getParent(node);
				while (parentNode) {
					this.setExpandedState(parentNode, true, options);
					parentNode = this.getParent(parentNode);
				}
			}, this));

			this.render();
		},

		/**
			Toggles a nodes expanded state; collapsing if expanded, expanding if collapsed.
			@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
			@param {optional Object} options
		*/
		toggleNodeExpanded : function (identifiers, options) {
			this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
				this.toggleExpandedState(node, options);
			}, this));
			
			this.render();
		},


		/**
			Check all tree nodes
			@param {optional Object} options
		*/
		checkAll : function (options) {
			var identifiers = this.findNodes('false', 'g', 'state.checked');
			this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
				this.setCheckedState(node, true, options);
			}, this));

			this.render();
		},

		/**
			Check a given tree node
			@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
			@param {optional Object} options
		*/
		checkNode : function (identifiers, options) {
			this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
				this.setCheckedState(node, true, options);
			}, this));

			this.render();
		},

		/**
			Uncheck all tree nodes
			@param {optional Object} options
		*/
		uncheckAll : function (options) {
			var identifiers = this.findNodes('true', 'g', 'state.checked');
			this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
				this.setCheckedState(node, false, options);
			}, this));

			this.render();
		},

		/**
			Uncheck a given tree node
			@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
			@param {optional Object} options
		*/
		uncheckNode : function (identifiers, options) {
			this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
				this.setCheckedState(node, false, options);
			}, this));

			this.render();
		},

		/**
			Toggles a nodes checked state; checking if unchecked, unchecking if checked.
			@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
			@param {optional Object} options
		*/
		toggleNodeChecked : function (identifiers, options) {
			this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
				this.toggleCheckedState(node, options);
			}, this));

			this.render();
		},


		/**
			Disable all tree nodes
			@param {optional Object} options
		*/
		disableAll : function (options) {
			var identifiers = this.findNodes('false', 'g', 'state.disabled');
			this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
				this.setDisabledState(node, true, options);
			}, this));

			this.render();
		},

		/**
			Disable a given tree node
			@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
			@param {optional Object} options
		*/
		disableNode : function (identifiers, options) {
			this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
				this.setDisabledState(node, true, options);
			}, this));

			this.render();
		},

		/**
			Enable all tree nodes
			@param {optional Object} options
		*/
		enableAll : function (options) {
			var identifiers = this.findNodes('true', 'g', 'state.disabled');
			this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
				this.setDisabledState(node, false, options);
			}, this));

			this.render();
		},

		/**
			Enable a given tree node
			@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
			@param {optional Object} options
		*/
		enableNode : function (identifiers, options) {
			this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
				this.setDisabledState(node, false, options);
			}, this));

			this.render();
		},

		/**
			Toggles a nodes disabled state; disabling is enabled, enabling if disabled.
			@param {Object|Number} identifiers - A valid node, node id or array of node identifiers
			@param {optional Object} options
		*/
		toggleNodeDisabled : function (identifiers, options) {
			this.forEachIdentifier(identifiers, options, langx.proxy(function (node, options) {
				this.setDisabledState(node, !node.state.disabled, options);
			}, this));

			this.render();
		},


		/**
			Common code for processing multiple identifiers
		*/
		forEachIdentifier : function (identifiers, options, callback) {

			options = langx.extend({}, _default.options, options);

			if (!(identifiers instanceof Array)) {
				identifiers = [identifiers];
			}

			langx.each(identifiers, langx.proxy(function (index, identifier) {
				callback(this.identifyNode(identifier), options);
			}, this));	
		},

		/*
			Identifies a node from either a node id or object
		*/
		identifyNode : function (identifier) {
			return ((typeof identifier) === 'number') ?
							this.nodes[identifier] :
							identifier;
		},

		/**
			Searches the tree for nodes (text) that match given criteria
			@param {String} pattern - A given string to match against
			@param {optional Object} options - Search criteria options
			@return {Array} nodes - Matching nodes
		*/
		search : function (pattern, options) {
			options = langx.extend({}, _default.searchOptions, options);

			this.clearSearch({ render: false });

			var results = [];
			if (pattern && pattern.length > 0) {

				if (options.exactMatch) {
					pattern = '^' + pattern + '$';
				}

				var modifier = 'g';
				if (options.ignoreCase) {
					modifier += 'i';
				}

				results = this.findNodes(pattern, modifier);

				// Add searchResult property to all matching nodes
				// This will be used to apply custom styles
				// and when identifying result to be cleared
				langx.each(results, function (index, node) {
					node.searchResult = true;
				})
			}

			// If revealResults, then render is triggered from revealNode
			// otherwise we just call render.
			if (options.revealResults) {
				this.revealNode(results);
			}
			else {
				this.render();
			}

			this.$element.trigger('searchComplete', langx.extend(true, {}, results));

			return results;
		},

		/**
			Clears previous search results
		*/
		clearSearch : function (options) {

			options = langx.extend({}, { render: true }, options);

			var results = langx.each(this.findNodes('true', 'g', 'searchResult'), function (index, node) {
				node.searchResult = false;
			});

			if (options.render) {
				this.render();	
			}
			
			this.$element.trigger('searchCleared', langx.extend(true, {}, results));
		},

		/**
			Find nodes that match a given criteria
			@param {String} pattern - A given string to match against
			@param {optional String} modifier - Valid RegEx modifiers
			@param {optional String} attribute - Attribute to compare pattern against
			@return {Array} nodes - Nodes that match your criteria
		*/
		findNodes : function (pattern, modifier, attribute) {

			modifier = modifier || 'g';
			attribute = attribute || 'text';

			var _this = this;
			return langx.grep(this.nodes, function (node) {
				var val = _this.getNodeValue(node, attribute);
				if (typeof val === 'string') {
					return val.match(new RegExp(pattern, modifier));
				}
			});
		},

		/**
			Recursive find for retrieving nested attributes values
			All values are return as strings, unless invalid
			@param {Object} obj - Typically a node, could be any object
			@param {String} attr - Identifies an object property using dot notation
			@return {String} value - Matching attributes string representation
		*/
		getNodeValue : function (obj, attr) {
			var index = attr.indexOf('.');
			if (index > 0) {
				var _obj = obj[attr.substring(0, index)];
				var _attr = attr.substring(index + 1, attr.length);
				return this.getNodeValue(_obj, _attr);
			}
			else {
				if (obj.hasOwnProperty(attr)) {
					return obj[attr].toString();
				}
				else {
					return undefined;
				}
			}
		}
	});

	var logError = function (message) {
		if (window.console) {
			window.console.error(message);
		}
	};


    plugins.register(TreeView,"treeview");

	return skylark.attach("intg.bs3.TreeView",TreeView);
});