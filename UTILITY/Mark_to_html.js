import MarkdownIt from "markdown-it";

const md = new MarkdownIt();

const marked = (text)=>{
    const md = new MarkdownIt();
    return md.render(text)
};

// Output the HTML

console.log(marked(`#  \`hi\`  there  my love.\n
! what are you doing  
a`))
console.log(marked("# hi"))


export default marked