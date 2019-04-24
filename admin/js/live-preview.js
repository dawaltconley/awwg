---
---

fetch("/admin/config.yml").then(r => r.text()).then(data => generatePreviews(data));
CMS.registerPreviewStyle("/css/main.css");

var docs = [
    {% for doc in site.documents %}
        {
            collection: '{{ doc.collection }}',
            path: '{{ doc.path }}',
            html: '{{ doc | strip_newlines | split: "<body" | last | split: "</body>" | first | prepend: "<div" | append: "</div>" }}'
        },
    {% endfor %}
];
var fieldsRegEx = /<!-- *?field +?(\w+?)="(\w*?)".*?-->.*?<!-- *?\/field *?-->/;

const updateHTML = (html, props, regEx = fieldsRegEx) => {
    let match, replace;
    while (match = regEx.exec(html)) {
        if (match[1] == "name") {
            replace = props.entry.getIn(["data", match[2]]);
        } else if (match[1] == "widget") {
            replace = ReactDOMServer.renderToString(props.widgetFor(match[2]));
        }
        html = html.replace(match[0], replace);
    }
    return html;
}

const generatePreviews = yaml => {
    const config = jsyaml.load(yaml);
    config.collections.forEach(c => {
        const collection = c.folder.match(/_(.*?)(?:\/.*)?$/)[1]; // don't creat this variable, name is too confusing
        const cDocs = docs.filter(d => d.collection === collection); // may not even need to do this...can i just use the document path? should always be unique? --> right now collection just serves as a way to get a generic layout for new docs
        CMS.registerPreviewTemplate(c.name, createClass({
            render () {
                const path = this.props.entry.get("path");
                const match = cDocs.find(d => d.path === path);
                const html = match ? match.html : cDocs[0].html;
                return h("div", { "dangerouslySetInnerHTML" : {__html: updateHTML(html, this.props) } });
            }
        }));
    })
}
