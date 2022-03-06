import fs from 'fs';

export { File, Directory }

class File {
  constructor(name, data) {
    this.name = name
    this.data = data
  }

  write(path='') {
    path += path === '' ? this.name : '//' + this.name
    fs.writeFileSync(path, this.data)
  }

  static read(path, name=path) {
    if (fs.existsSync(path)) {
      const data = fs.readFileSync(path, 'utf8')
      return new File(name, data)
    } else {
      console.warn(`[WARNING] Could not read file ${name}`)
      return null
    }
  }

  toString() {
    return `${this.name}`
  }
}

class Directory {
  constructor(name) {
    this.name = name
    this.files = []
    this.directories = []
  }

  write(path='') {
    path += path === '' ? this.name : '//' + this.name
    fs.rmdir(path, () => {})
    fs.mkdir(path, () => {})
    this.files.forEach((file) => {
      file.write(path)
    })
    this.directories.forEach((directory) => {
      directory.write(path)
    })
  }

  static read(dirname) {
    const directory = new Directory(dirname)
    const files = fs.readdirSync(dirname)
    files.forEach((filename) => {
      const path = dirname + '\\' + filename
      if (!filename.includes('.')) {
        const subDirectory = Directory.read(path)
        subDirectory.name = filename
        directory.directories.push(subDirectory)
      } else {
        const file = File.read(path)
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
