import fs from 'fs';

export { File, Directory }

class File {
  constructor(name, data, location='') {
    this.name = name
    this.data = data
    this.location = location
  }

  write(location=this.location) {
    fs.writeFileSync(location + '\\' + this.name, this.data)
  }

  static read(path) {
    if (!fs.existsSync(path)) {
      console.warn(`[WARNING] Could not read file ${path}`)
      return null
    }
    const data = fs.readFileSync(path, 'utf8')
    const [name, location] = splitPath(path)
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

  write(location=this.location) {
    const path = location + '\\' + this.name
    console.log(path);
    fs.rmdir(path, () => {})
    fs.mkdir(path, () => {})
    this.files.forEach((file) => {
      file.write(path)
    })
    this.directories.forEach((directory) => {
      directory.write(path)
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
  return [name, location]
}

function isDirectoryPath(path) {
  const [name] = splitPath(path)
  return path.endsWith('//') || !name.includes('.')
}
