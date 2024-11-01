import { format } from 'prettier'

const pluginName = 'svg-tidy'

function getAttributeOrder(attr) {
  if (attr.startsWith('id=')) return -100
  if (attr.startsWith('class=')) return -99
  else return 0
}

const parsers = {
  html: {
    parse: async (text, options) => {
      let formatted = await format(text, {
        ...options,
        plugins: options.plugins.filter((plugin) => plugin.name !== pluginName),
      })

      let tidied = formatted.replace(/<svg[\s\S]+?<\/svg\s*>/g, (t) => {
        return t.replace(/<([\w-]+)\s([\s\S]+?)>/g, (c, tag, attrs) => {
          let res = Array.from(attrs.matchAll(/(?:\S+="[\s\S]+?")/g))
            .map((c) => c[0].trim())
            .sort((a, b) => getAttributeOrder(a) - getAttributeOrder(b))
            .join(' ')
          return `<${tag} ${res}>`
        })
      })

      return {
        type: 'FormattedText',
        body: tidied,
        // body: "",
      }
    },
    astFormat: 'svg-tidy-ast',
  },
}

const printers = {
  'svg-tidy-ast': {
    print: (path, options, print) => {
      return path.node.body
    },
  },
}

export default {
  name: pluginName,
  parsers,
  printers,
}
