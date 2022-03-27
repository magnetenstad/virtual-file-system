import fs from 'fs';

export { File, Directory }

class File {
  constructor(name, data, location='') {
    this.name = name
    this.data = data
    this.metadata = {}
    this.location = location
  }

  write(location=this.location) {
    const path = ((location ? location + '\\' : '') + this.name)
        .replace('\\\\', '\\').trimStart('\\')
    fs.writeFileSync(path, this.data)
  }

  static read(path) {
    if (!fs.existsSync(path)) {
      console.warn(`[WARNING] Could not read file ${path}`)
      return null
    }
    const [name, location, extension] = splitPath(path)
    const data = fs.readFileSync(path, getEncoding(extension))
    return new File(name, data, location)
  }

  toString() {
    return `${this.name}`
  }
}

class Directory {
  constructor(name, location='') {
    this.name = name
    this.location = location
    this.files = []
    this.directories = []
  }

  /**
   * Overwrites existing folder.
   * @param {string} location 
   */
  write(location=this.location) {
    const path = ((location ? location + '\\' : '') + this.name)
        .replace('\\\\', '\\').trimStart('\\')
    fs.rmSync(path, { recursive: true, force: true })
    fs.mkdir(path, (err) => {if (err) console.warn(err)})
    this.files.forEach((file) => {
      file.write(path)
    })
    this.directories.forEach((directory) => {
      directory.write(path)
    })
  }

  writeContents(location=this.location) {
    this.files.forEach((file) => {
      file.write(location)
    })
    this.directories.forEach((directory) => {
      directory.write(location)
    })
  }

  static read(path, exclude=[]) {
    if (!fs.existsSync(path)) {
      console.warn(`[WARNING] Could not read directory ${path}`)
      return null
    }
    const [name, location] = splitPath(path)
    const directory = new Directory(name, location)
    const files = fs.readdirSync(path)
    files.forEach((filename) => {
      if (exclude.includes(filename)) return
      const subPath = path + '\\' + filename
      if (isDirectoryPath(subPath)) {
        const subDirectory = Directory.read(subPath, exclude)
        directory.directories.push(subDirectory)
      } else {
        const file = File.read(subPath)
        file.name = filename
        directory.files.push(file)
      }
    })
    return directory
  }

  getDirectories(name) {
    return this.directories.filter((dir) => dir.name.match(name))
  }

  getDirectory(name) {
    const files = this.getDirectories(name)
    return files.length ? files[0] : null
  }

  getFiles(name) {
    return this.files.filter((file) => file.name.match(name))
  }

  getFile(name) {
    const files = this.getFiles(name)
    return files.length ? files[0] : null
  }

  removeFile(file) {
    const index = this.files.indexOf(file)
    if (index > -1) {
      this.files.splice(index, 1)
    }
  }

  apply(func) {
    this.files.forEach((file) => {
      func(file)
    })
    this.directories.forEach((directory) => {
      directory.apply(func)
    })
  }
  
  toString() {
    let string = `${this.name} {`
    this.files.forEach((file) => {
      string += `\n${file.toString()}`
    })
    this.directories.forEach((directory) => {
      string += `\n${directory.toString()}`
    })
    string = string.replaceAll('\n', '\n\t')
    return `${string}\n}`
  }
}

function splitPath(path) {
  const split = path.split('\\').filter((e) => e !== '')
  let name = ''
  while (name === '') {
    name = split.pop()
  }
  const location = split.join('\\') + '\\'
  const extension = name.includes('.') 
    ? name.substring(name.lastIndexOf('.') + 1).toLowerCase()
    : ''
  return [name, location, extension]
}

function isDirectoryPath(path) {
  const [name] = splitPath(path)
  return path.endsWith('//') || !name.includes('.')
}

function getEncoding(extension) {
  switch (extension) {
    case 'png':
      return ''
    case 'jpg':
      return ''
    case 'jpeg':
      return ''
    case 'ico':
      return ''
    default:
      return 'utf-8'
  }
}
