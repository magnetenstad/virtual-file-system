import { File, Directory } from '..\\files.js'
import fs from 'fs'

describe('File', () => {
  beforeEach(() => {
    fs.mkdirSync('src\\test\\assets\\')
    fs.mkdirSync('src\\test\\assets\\texts\\')
    fs.writeFileSync('src\\test\\assets\\markdown.md',
        '# A basic markdown file')
    fs.writeFileSync('src\\test\\assets\\texts\\text.txt', 'text')
  });

  afterEach(() => {
    fs.rmSync('src\\test\\assets', { recursive: true, force: true })
  });

  it('Cannot read files that do not exist', () => {
    const file = File.read('void')
    expect(file).toBe(null)
  })

  it('Can read files', () => {
    const file = File.read('src\\test\\assets\\markdown.md')
    expect(file.name).toBe('markdown.md')
    expect(file.location).toBe('src\\test\\assets\\')
    expect(file.data).toBe('# A basic markdown file')
  })

  it('Can save files', () => {
    const file = new File('new.md', 'A new test file.', 'src\\test\\assets\\')
    file.write()
    const readFile = File.read('src\\test\\assets\\new.md')
    expect(readFile).toEqual(file)
  })

  it('Can edit files', () => {
    const file = File.read('src\\test\\assets\\markdown.md')
    file.name = 'renamed.md'
    file.write()
    const renamed = File.read('src\\test\\assets\\renamed.md')
    expect(renamed.data).toBe(file.data)
  })

  it('Can read and write images', () => {
    // This does not actually guarantee that images work
    const file = File.read('src\\test\\gull.jpg')
    file.name = 'gull2.jpg'
    file.location += '\\assets\\'
    file.write()
    const file2 = File.read('src\\test\\assets\\gull2.jpg')
    expect(file.data).toEqual(file2.data)
  })
})

describe('Directory', () => {
  beforeEach(() => {
    fs.mkdirSync('src\\test\\assets')
    fs.mkdirSync('src\\test\\assets\\texts')
    fs.writeFileSync('src\\test\\assets\\markdown.md',
        '# A basic markdown file')
    fs.writeFileSync('src\\test\\assets\\texts\\text.txt', 'text')
  });

  afterEach(() => {
    fs.rmSync('src\\test\\assets', { recursive: true, force: true })
  });

  it('Cannot read directories that do not exist', () => {
    const directory = Directory.read('void')
    expect(directory).toBe(null)
  })

  it('Can read directories', () => {
    const directory = Directory.read('src\\test\\assets\\')
    expect(directory.name).toBe('assets')
    expect(directory.files).toEqual([
        new File('markdown.md',
            '# A basic markdown file',
            'src\\test\\assets\\')])
    expect(directory.directories.length).toBe(1)
    expect(directory.directories[0].name).toBe('texts')
    expect(directory.directories[0].files.length).toBe(1)
    expect(directory.directories[0].directories.length).toBe(0)
    expect(directory.directories[0].files[0]).toEqual(
        new File('text.txt', 'text', 'src\\test\\assets\\texts\\'))
  })

  it('Can save directories', () => {
    const directory = new Directory('new', 'src\\test\\assets\\')
    const file = new File('new.md', 'new file')
    directory.files.push(file)
    directory.write()
    const readFile = File.read('src\\test\\assets\\new\\new.md')
    expect(readFile.data).toBe(file.data)
  })

  it('Can edit directories', () => {
    const directory = Directory.read('src\\test\\assets\\')
    directory.name = 'renamed'
    directory.location += '\\assets\\'
    directory.write()
    const file = File.read('src\\test\\assets\\texts\\text.txt')
    const renamed = File.read('src\\test\\assets\\renamed\\texts\\text.txt')
    expect(renamed.data).toBe(file.data)
  })

  it('Can write contents', () => {
    const directory = Directory.read('src\\test\\assets\\')
    directory.writeContents('src\\test\\assets\\texts\\')
    const subDirectory = Directory.read('src\\test\\assets\\texts\\texts\\')
    expect(directory.getDirectory('texts').getFile('text.txt').data)
        .toBe(subDirectory.getFile('text.txt').data)
  })

  it('Can apply functions', () => {
    const directory = Directory.read('src\\test\\assets\\')
    directory.apply((file) => {
      file.name += '1'
      file.data += '1'
    })
    const file = directory.getFile('markdown.md1')
    expect(file.data).toBe('# A basic markdown file1')
  })
})
