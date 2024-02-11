import MarkdownIt from "markdown-it";

const md = new MarkdownIt();

const marked = (text)=>{
    const md = new MarkdownIt();
    return md.render(text)
};

// Output the HTML

export default marked