---
outline: deep
---

# Chart Examples

This page demonstrates usage of some of the runtime APIs provided by VitePress.

The main `useData()` API can be used to access site, theme, and page data for the current page. It works in both `.md` and `.vue` files:

<div ref="container" class="univer-container" />

```md
<script setup>
import { useData } from 'vitepress'

const { theme, page, frontmatter } = useData()
</script>

## Results

### Theme Data
<pre>{{ theme }}</pre>

### Page Data
<pre>{{ page }}</pre>

### Page Frontmatter
<pre>{{ frontmatter }}</pre>
```

<script setup lang="ts">
import "@univerjs/design/lib/index.css";
import "@univerjs/ui/lib/index.css";
import "@univerjs/docs-ui/lib/index.css";
import "@univerjs/sheets-ui/lib/index.css";
import "@univerjs/sheets-formula/lib/index.css";

import { Univer, UniverInstanceType, Workbook, LocaleType, IWorkbookData, Tools } from "@univerjs/core";
import { defaultTheme } from "@univerjs/design";
import { UniverDocsPlugin } from "@univerjs/docs";
import { UniverDocsUIPlugin } from "@univerjs/docs-ui";
import { UniverFormulaEnginePlugin } from "@univerjs/engine-formula";
import { UniverRenderEnginePlugin } from "@univerjs/engine-render";
import { UniverSheetsPlugin } from "@univerjs/sheets";
import { UniverSheetsFormulaPlugin } from "@univerjs/sheets-formula";
import { UniverSheetsUIPlugin } from "@univerjs/sheets-ui";
import { UniverUIPlugin } from "@univerjs/ui";
import { UniverChartPlugin } from "univer-chart-plugin";
import { onBeforeUnmount, onMounted, ref, toRaw } from "vue";

import DesignZhCN from '@univerjs/design/locale/zh-CN';
import DesignEnUS from '@univerjs/design/locale/en-US';
import UIZhCN from '@univerjs/ui/locale/zh-CN';
import UIEnUS from '@univerjs/ui/locale/en-US';
import SheetsZhCN from '@univerjs/sheets/locale/zh-CN';
import SheetsEnUS from '@univerjs/sheets/locale/en-US';
import SheetsUIZhCN from '@univerjs/sheets-ui/locale/zh-CN';
import SheetsUIEnUS from '@univerjs/sheets-ui/locale/en-US';

import 'univer-chart-plugin/lib/index.css';

import { DEFAULT_WORKBOOK_DATA } from './default-workbook-data';

const data = ref(DEFAULT_WORKBOOK_DATA);

const univerRef = ref<Univer | null>(null);
const workbook = ref<Workbook | null>(null);
const container = ref<HTMLElement | null>(null);

onMounted(() => {
  init(data);
});

onBeforeUnmount(() => {
  destroyUniver();
});

/**
 * Initialize univer instance and workbook instance
 * @param data {IWorkbookData} document see https://univer.ai/typedoc/@univerjs/core/interfaces/IWorkbookData
 */
const init = (data = {}) => {
console.log(data)
  const univer = new Univer({
    theme: defaultTheme,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.ZH_CN]: Tools.deepMerge(
      SheetsZhCN,
      SheetsUIZhCN,
      UIZhCN,
      DesignZhCN,
    ),
      [LocaleType.EN_US]: Tools.deepMerge(
      SheetsEnUS,
      SheetsUIEnUS,
      UIEnUS,
      DesignEnUS,
    ),
    },
  });
  univerRef.value = univer;

  // core plugins
  univer.registerPlugin(UniverRenderEnginePlugin);
  univer.registerPlugin(UniverFormulaEnginePlugin);
  univer.registerPlugin(UniverUIPlugin, {
    container: container.value!,
  });

  // doc plugins
  univer.registerPlugin(UniverDocsPlugin, {
    hasScroll: false,
  });
  univer.registerPlugin(UniverDocsUIPlugin);

  // sheet plugins
  univer.registerPlugin(UniverSheetsPlugin);
  univer.registerPlugin(UniverSheetsUIPlugin);
  univer.registerPlugin(UniverSheetsFormulaPlugin);

  univer.registerPlugin(UniverChartPlugin);

  // create workbook instance
  workbook.value = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, data.value)
};

/**
 * Destroy univer instance and workbook instance
 */
const destroyUniver = () => {
  toRaw(univerRef.value)?.dispose();
  univerRef.value = null;
  workbook.value = null;
};

/**
 * Get workbook data
 */
const getData = () => {
  if (!workbook.value) {
    throw new Error('Workbook is not initialized');
  }
  return workbook.value.save();
};

defineExpose({
  getData,
  destroyUniver
});

</script>

<style scoped>
.univer-container {
  width: 100%;
  height: 600px;
  overflow: hidden;
}

/* Also hide the menubar */
:global(.univer-menubar) {
  display: none;
}
</style>


Check out the documentation for the [full list of runtime APIs](https://vitepress.dev/reference/runtime-api#usedata).
