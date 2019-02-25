---
---

CMS.registerPreviewStyle("/css/main.css");

var fieldsRegEx = /<!-- *?field +?(\w+?)="(\w*?)".*?-->.*?<!-- *?\/field *?-->/;

function updateHTML (html, props) {
    var match;
    var replace;
    while (match = fieldsRegEx.exec(html)) {
        if (match[1] == "name") {
            replace = props.entry.getIn(["data", match[2]]);
        } else if (match[1] == "widget") {
            replace = ReactDOMServer.renderToString(props.widgetFor(match[2]));
        }
        html = html.replace(match[0], replace);
    }
    return html;
}

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
            var html = {{ c.label }}[this.props.entry.get("slug")]; // use html content from page with corresponding slug
            return h("div", { "dangerouslySetInnerHTML" : {__html: updateHTML(html, this.props) } });
        }
    }));

{% endfor %}
