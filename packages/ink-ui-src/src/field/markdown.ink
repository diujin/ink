<link rel="import" type="component" href="../form/button.ink" name="form-button" />
<link rel="import" type="component" href="../element/icon.ink" name="element-icon" />
<link rel="import" type="component" href="./editor.ink" name="field-editor" />
<style>
  .tui-field-markdown-nav {
    display: none;
    position: relative;
  }
  :host(:hover) .tui-field-markdown-nav {
    display: block;
  }
  .tui-field-markdown-edit {
    bottom: 0;
    position: absolute;
    right: 0;
  }
  .tui-field-markdown-view {
    bottom: 0;
    position: absolute;
    right: 0;
  }
  .tui-field-markdown-editor {
    height: 100%;
    width: 100%;
  }
  .tui-field-markdown-preview {
    background-color: var(--white);
    border: 0;
    height: 100%;
    overflow: auto;
    width: 100%;
  }
</style>
<script>
  import StyleSet from '@stackpress/ink/dist/style/StyleSet';
  import setDisplay from '../utilities/style/display';
  import { marked } from 'marked';
  //extract props
  const { name, value, numbers, change, update } = this.props;
  //override default styles
  const styles = new StyleSet();
  const css = this.styles();
  this.styles = () => css + styles.toString();
  //determine display
  setDisplay(this.props, styles, 'block', ':host');
  const children = this.originalChildren;
  const handlers = {
    change: e => {
      const textarea = this.querySelector('textarea');
      if (textarea) {
        textarea.value = e.target.value;
      }
      change && change(e);
    },
    edit: () => {
      const shadow = this.shadowRoot;
      if (!shadow) return;
      const edit = shadow.querySelector('.tui-field-markdown-edit');
      const view = shadow.querySelector('.tui-field-markdown-view');
      const editor = shadow.querySelector('.tui-field-markdown-editor');
      const preview = shadow.querySelector('.tui-field-markdown-preview');
      
      editor.style.display = 'block';
      preview.style.display = 'none';
      view.style.display = 'inline-block';
      edit.style.display = 'none';
    },
    view: () => {
      const shadow = this.shadowRoot;
      if (!shadow) return;
      const edit = shadow.querySelector('.tui-field-markdown-edit');
      const view = shadow.querySelector('.tui-field-markdown-view');
      const editor = shadow.querySelector('.tui-field-markdown-editor');
      const preview = shadow.querySelector('.tui-field-markdown-preview');
      const html = marked.parse(editor._editor.getValue() || '');
      
      preview.src = `data:text/html;charset=utf-8,${encodeURI(html)}`;
      editor.classList.add('none');
      editor.style.display = 'none';
      preview.style.display = 'block';
      view.style.display = 'none';
      edit.style.display = 'inline-block';
    }
  };
</script>
<template type="light">
  <textarea {name} {value}>{children}</textarea>
</template>
<template type="shadow">
  <nav class="tui-field-markdown-nav">
    <form-button 
      sm muted 
      class="tui-field-markdown-edit" 
      style="display:none" 
      type="button" 
      click={handlers.edit}
    >
      <element-icon name="edit" />
    </form-button>
    <form-button 
      sm muted 
      class="tui-field-markdown-view" 
      type="button" 
      click={handlers.view}
    >
      <element-icon name="eye" />
    </form-button>
  </nav>
  <field-editor 
    class="tui-field-markdown-editor" 
    lang="md" 
    {numbers} 
    {name} 
    {value} 
    {update} 
    change={handlers.change}
  >{
    children
  }</field-editor>
  <iframe class="tui-field-markdown-preview" style="display:none"></iframe>
</template>