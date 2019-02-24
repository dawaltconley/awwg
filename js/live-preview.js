---
---

CMS.registerPreviewStyle("/css/main.css");

{% for c in site.collections %}

    // make a map of file slugs and their html content
    var {{ c.label }} = {
        {% for doc in c.docs %}
            {% assign template = doc | strip_newlines | split: '<body' | last | split: '</body>' | first | prepend: '<div' | append: '</div>' %}
            {{ doc.slug }} : '{{ template }}'{% unless forloop.last %},{% endunless %}
        {% endfor %}
    }

    // generate a live preview
    CMS.registerPreviewTemplate("{{ c.label }}", createClass({
        render () {
            var entry = this.props.entry;
            var widgetFor = this.props.widgetFor;

            var html = {{ c.label }}[entry.get("slug")]; // use html content from page with corresponding slug

            function updateHTML () {
                var fields = /<!-- *?field +?(\w+?)="(\w*?)".*?-->.*?<!-- *?\/field *?-->/;
                var match;
                var replace;
                while (match = fields.exec(html)) {
                    if (match[1] == "name") {
                        replace = entry.getIn(["data", match[2]]);
                    } else if (match[1] == "widget") {
                        replace = ReactDOMServer.renderToString(widgetFor(match[2]));
                    }
                    html = html.replace(match[0], replace);
                }
                return html;
            }

            return h("div", { "dangerouslySetInnerHTML" : {__html: updateHTML() } });
        }
    }));

{% endfor %}
