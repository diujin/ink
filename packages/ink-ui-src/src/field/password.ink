<script observe="autocomplete,disabled,name,pattern,readonly,required,value">
  import StyleSet from '@stackpress/ink/dist/style/StyleSet';
  import signal from '@stackpress/ink/dist/client/api/signal'; 
  import { 
    getProps, 
    getHandlers,
    setDefaultStyles 
  } from '../utilities/input';
  //get props
  //extract props
  const { 
    //handlers
    change, update,
    //input attributes
    attributes, 
    //the rest of the props
    ...props
  } = getProps(this);
  //override default styles
  const styles = new StyleSet();
  this.styles = () => styles.toString();
  //set default styles
  setDefaultStyles(props, styles);
  styles.add('div', 'display', 'flex');
  styles.add('div', 'align-items', 'center');
  styles.add('span', 'cursor', 'pointer');
  styles.add('span', 'padding', '0 7px');
  styles.add('span', 'color', 'var(--muted)');
  
  //get handlers
  const handlers = getHandlers(this, change, update);
  handlers.toggle = () => {
    const value = this.querySelector('input')?.value;
    exposed.value = !exposed.value;
    const input = this.querySelector('input');
    if (input) {
      input.value = value;
    }
  };
  //make a state
  const exposed = signal(false);
</script>
<template type="light">
  <input 
    {...attributes} 
    type={exposed.value ? 'text' : 'password'}
    change={handlers.change} 
  />
</template>
<template type="shadow">
  <div>
    <slot></slot>
    <span click={handlers.toggle}>
      {exposed.value ? '✷': 'A' }
    </span>
  </div>
</template>