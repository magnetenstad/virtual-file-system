import { File, Directory } from '../files.js'
import fs from 'fs'

describe('File', () => {
  beforeAll(() => {
    fs.mkdirSync('src/test/assets')
    fs.mkdirSync('src/test/assets/folder')
    fs.writeFileSync('src/test/assets/markdown.md', '# A basic markdown file')
    fs.writeFileSync('src/test/assets/folder/text.txt', 'text')
  });

  afterAll(() => {
    fs.rmSync('src/test/assets', { recursive: true, force: true })
  });

  it('Cannot read files that do not exist', () => {
    const file = File.read('void')
    expect(file).toBe(null)
  })

  it('Can read files', () => {
    const file = File.read('src/test/assets/markdown.md')
    expect(file.name).toBe('src/test/assets/markdown.md')
    expect(file.data).toBe('# A basic markdown file')
  })

  it('Can save files', () => {
    const file = new File('src/test/assets/new.md', 'A new test file.')
    file.write()
    const readFile = File.read('src/test/assets/new.md')
    expect(readFile).toEqual(file)
  })

  it('Can edit files', () => {
    const file = File.read('src/test/assets/markdown.md')
    file.name = 'src/test/assets/renamed.md'
    file.write()
    const renamed = File.read('src/test/assets/renamed.md')
    expect(renamed.data).toBe(file.data)
  })
})

describe('Directory', () => {
  beforeAll(() => {
    fs.mkdirSync('src/test/assets')
    fs.mkdirSync('src/test/assets/folder')
    fs.writeFileSync('src/test/assets/markdown.md', '# A basic markdown file')
    fs.writeFileSync('src/test/assets/folder/text.txt', 'text')
  });

  afterAll(() => {
    fs.rmSync('src/test/assets', { recursive: true, force: true })
  });

  it('Cannot read directories that do not exist', () => {
    const directory = Directory.read('void')
    expect(directory).toBe(null)
  })

  it('Can read directories', () => {
    const directory = Directory.read('src/test/assets')
    expect(directory.name).toBe('src/test/assets')
    expect(directory.files).toEqual(
        [new File('markdown.md', '# A basic markdown file')])
    expect(directory.directories.length).toBe(1)
    expect(directory.directories[0].name).toBe('folder')
    expect(directory.directories[0].files.length).toBe(1)
    expect(directory.directories[0].directories.length).toBe(0)
    expect(directory.directories[0].files[0])
        .toEqual(new File('text.txt', 'text'))
  })

  it('Can save directories', () => {
    const directory = new Directory('src/test/assets/new')
    const file = new File('new.md', 'new file')
    directory.files.push(file)
    directory.write()
    const readFile = File.read('src/test/assets/new/new.md')
    expect(readFile.data).toBe(file.data)
  })

  it('Can edit directories', () => {
    const directory = Directory.read('src/test/assets')
    directory.name = 'src/test/assets/renamed'
    directory.write()
    const file = File.read('src/test/assets/folder/text.txt')
    const renamed = File.read('src/test/assets/renamed/folder/text.txt')
    expect(renamed.data).toBe(file.data)
  })
})
