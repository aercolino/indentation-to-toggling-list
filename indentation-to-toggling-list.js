jQuery(function($) {

    'use strict';
    IndentationToTogglingList();
    return;

    function IndentationToList(options) {

        return Main(options);


        function Interpolate(template, variables) {
            var names = Object.keys(variables);
            var result = template;
            for (var i = 0, iTop = names.length; i < iTop; i++) {
                var name = names[i];
                var value = variables[name];
                var re = RegExp('\\b' + name + '\\b', 'g');
                result = result.replace(re, value);
            }
            return result;
        }

        function Parse(lineText, lineNumber, indent) {
            var aux = lineText.split(indent);
            var result = {
                'level': aux.length - 1,
                'label': aux.pop(),
                'line': lineNumber
            };
            return result;
        }

        function InitOptions(options) {
            var defaultOptions = {
                indent: '  ',
                templates: {
                    folder: '<li class="folder"> <label class="ToggleOnClick" for="ID">FOLDER</label> <ol>CONTENT</ol> </li>',
                    file: '<li class="File">FILE</li>',
                    folderWithoutContent: '<li class="Folder"><label for="ID">FOLDER</label></li>',
                    contentWithoutFolder: '<ol class="Directory">CONTENT</ol>'
                },
                text: ''
            };
            if (options.constructor.name !== 'Object') {
                options = {
                    text: String(options)
                };
            }
            var result = {
                indent: options.indent || defaultOptions.indent,
                templates: options.templates || defaultOptions.templates,
                text: options.text
            };
            return result;
        }

        function InitLines(text) {
            var result = text.
            replace('\r\n', '\n'). // remove double line endings
            replace('\r', '\n'). // remove odd line endings
            split('\n'). // get lines
            filter(function(value) { // remove empty lines
                return value !== '';
            });
            result.push(''); // append an empty line
            return result;
        }

        function InitStack() {
            var result = {
                data: [],
                lastParent: null,
                lastChild: null
            };
            result.lastChild = result.data;
            return result;
        }

        function AddChild(stack, info, asSibling) {
            var last = asSibling ? stack.lastParent : stack.lastChild;
            info.parent = last;
            var node = [info];
            last.push(node);
            stack.lastParent = info.parent;
            stack.lastChild = node;
        }

        function ChildrenToHTML(stack, templates, contentWithoutFolder) {
            var last = stack.lastParent;
            var parent = last[0];
            var children = last.splice(1); // last.length === 1
            var items = [];
            for (var i = 0, iTop = children.length; i < iTop; i++) {
                var child = children[i];
                var isStringified = typeof child[0] === 'string';
                var isFolder = !isStringified && child[0].label.search(/\/$/) >= 0;
                var isFile = !isStringified && !isFolder;
                var html;
                switch (true) {
                    case isStringified:
                        html = child[0];
                        break;

                    case isFolder:
                        html = Interpolate(templates.folderWithoutContent, { ID: 'folder_' + child[0].line, FOLDER: child[0].label });
                        break;

                    case isFile:
                        html = Interpolate(templates.file, { FILE: child[0].label });
                        break;
                }
                items.push(html);
            }
            var template = contentWithoutFolder ? templates.contentWithoutFolder : templates.folder;
            last[0] = Interpolate(template, { ID: 'folder_' + parent.line, FOLDER: parent.label, CONTENT: items.join('') });
            stack.lastParent = parent.parent;
            stack.lastChild = last;
        }

        function ParentsToHTML(stack, templates) {
            stack.data.pop(); // remove the last child (due to the last empty line)
            stack.data.unshift({ // prepend a fictitious parent to easily wrap up all real parents
                label: '',
                level: -1,
                line: '',
                parent: null
            });
            ChildrenToHTML(stack, templates, true);
            var result = stack.lastChild[0];
            return result;
        }

        function Main(options) {
            options = InitOptions(options);
            if (!options.text) {
                return '';
            }
            var lines = InitLines(options.text);
            var stack = InitStack();
            var level = -1;
            for (var i = 0, iTop = lines.length; i < iTop; i++) {
                var line = lines[i];
                var Parsed = Parse(line, i, options.indent);
                switch (true) {
                    case Parsed.level > level:
                        AddChild(stack, Parsed);
                        level += 1; // go one level in
                        break;

                    case Parsed.level === level:
                        AddChild(stack, Parsed, true);
                        break;

                    case Parsed.level < level:
                        ChildrenToHTML(stack, options.templates);
                        level -= 1; // go only one level out, so that ChildrenToHTML can be called again (if any)
                        i -= 1; // still need to process the current line
                        break;
                }
            }
            // thanks to the last empty line, all children have been stringified by now
            var result = ParentsToHTML(stack, options.templates);
            return result;
        }
    }

    function ToggleOnClick(listContainer$) {
        listContainer$.find('ol.Directory label.ToggleOnClick').click(function() {
            $(this).parent().find('ol').eq(0).toggle();
        });
    }

    function Expand(listContainer$, paths) {
        if (!paths.length) {
            return;
        }
        listContainer$.find('ol.Directory ol').hide();
        while (paths.length) {
            var path = paths.shift();
            var folders = path.replace(/\/$/, '').split('/').map(function(folder) {
                return folder + '/';
            });
            var next = listContainer$.find('ol.Directory');
            while (folders.length && next) {
                var folder = folders.shift();
                var container = next;
                next = null;
                container
                    .find('> li > label.ToggleOnClick')
                    .filter(function() {
                        return $(this).text() === folder;
                    })
                    .each(function() {
                        next = $(this).parent().find('ol').eq(0);
                        next.show();
                    });
            }
        }
    }

    function IndentationToTogglingList() {
        $('.IndentationToTogglingList').each(function() {
            var listContainer$ = $(this);
            var text = listContainer$.text();
            var converted = IndentationToList(text);
            listContainer$.html(converted);
            ToggleOnClick(listContainer$);
            var paths = listContainer$.data('expand');
            if (typeof paths === 'string') {
                // this happens if the post author used single quotes for array elements
                paths = JSON.parse(paths.replace(/'/g, '"'));
            }
            Expand(listContainer$, paths || []);
        });
    }

});
