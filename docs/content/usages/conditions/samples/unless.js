// hide-next-line
const nikita = require('nikita');
(async () => {
  var {status} = await nikita
  // Update file content
  .file({
    target: '/tmp/nikita/a_file',
    content: 'hello',
    // highlight-range{1-8}
    unless: [
      '',
      0,
      false,
      null,
      undefined,
      function({config}){ return config.content !== 'hello' },
    ]
  })
  console.info('File is updated:', status)
})()
