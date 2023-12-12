import get from 'lodash-es/get'


let en = {

    // Set Filter
    selectAll: '(Select All)',
    selectAllSearchResults: '(Select All Search Results)',
    searchOoo: 'Search...',
    blanks: '(Blanks)',
    noMatches: 'No matches',

    // Number Filter & Text Filter
    filterOoo: 'Filter...',
    equals: 'Equals',
    notEqual: 'Not equal',
    blank: 'Blank',
    notBlank: 'Not blank',
    empty: 'Choose One',

    // Number Filter
    lessThan: 'Less than',
    greaterThan: 'Greater than',
    lessThanOrEqual: 'Less than or equal',
    greaterThanOrEqual: 'Greater than or equal',
    inRange: 'In range',
    inRangeStart: 'from',
    inRangeEnd: 'to',

    // Text Filter
    contains: 'Contains',
    notContains: 'Not contains',
    startsWith: 'Starts with',
    endsWith: 'Ends with',

    // Date Filter
    dateFormatOoo: 'yyyy-mm-dd',

    // Filter Conditions
    andCondition: 'AND',
    orCondition: 'OR',

    // Filter Buttons
    applyFilter: 'Apply',
    resetFilter: 'Reset',
    clearFilter: 'Clear',
    cancelFilter: 'Cancel',

    // Filter Titles
    textFilter: 'Text Filter',
    numberFilter: 'Number Filter',
    dateFilter: 'Date Filter',
    setFilter: 'Set Filter',

    // Group Column Filter
    groupFilterSelect: 'Select field:',

    // Advanced Filter
    advancedFilterContains: 'contains',
    advancedFilterNotContains: 'does not contain',
    advancedFilterTextEquals: 'equals',
    advancedFilterTextNotEqual: 'does not equal',
    advancedFilterStartsWith: 'starts with',
    advancedFilterEndsWith: 'ends with',
    advancedFilterBlank: 'is blank',
    advancedFilterNotBlank: 'is not blank',
    advancedFilterEquals: '=',
    advancedFilterNotEqual: '!=',
    advancedFilterGreaterThan: '>',
    advancedFilterGreaterThanOrEqual: '>=',
    advancedFilterLessThan: '<',
    advancedFilterLessThanOrEqual: '<=',
    advancedFilterTrue: 'is true',
    advancedFilterFalse: 'is false',
    advancedFilterAnd: 'AND',
    advancedFilterOr: 'OR',
    advancedFilterApply: 'Apply',
    advancedFilterValidationMissingColumn: 'Column is missing',
    advancedFilterValidationMissingOption: 'Option is missing',
    advancedFilterValidationMissingValue: 'Value is missing',
    advancedFilterValidationInvalidColumn: 'Column not found',
    advancedFilterValidationInvalidOption: 'Option not found',
    advancedFilterValidationMissingQuote: 'Value is missing an end quote',
    advancedFilterValidationNotANumber: 'Value is not a number',
    advancedFilterValidationMissingCondition: 'Condition is missing',
    advancedFilterValidationJoinOperatorMismatch: 'Join operators within a condition must be the same',
    advancedFilterValidationInvalidJoinOperator: 'Join operator not found',
    advancedFilterValidationMissingEndBracket: 'Missing end bracket',
    advancedFilterValidationExtraEndBracket: 'Too many end brackets',
    advancedFilterValidationMessage: 'Expression has an error. ${variable1} - ${variable2}.',
    advancedFilterValidationMessageAtEnd: 'Expression has an error. ${variable} at end of expression.',

    // Side Bar
    columns: 'Columns',
    filters: 'Filters',

    // columns tool panel
    pivotMode: 'Pivot Mode',
    groups: 'Row Groups',
    rowGroupColumnsEmptyMessage: 'Drag here to set row groups',
    values: 'Values',
    valueColumnsEmptyMessage: 'Drag here to aggregate',
    pivots: 'Column Labels',
    pivotColumnsEmptyMessage: 'Drag here to set column labels',

    // Header of the Default Group Column
    group: 'Group',

    // Row Drag
    rowDragRow: 'row',
    rowDragRows: 'rows',

    // Other
    loadingOoo: 'Loading...',
    loadingError: 'ERR',
    noRowsToShow: 'No Rows To Show',
    enabled: 'Enabled',

    // Menu
    pinColumn: 'Pin Column',
    pinLeft: 'Pin Left',
    pinRight: 'Pin Right',
    noPin: 'No Pin',
    valueAggregation: 'Value Aggregation',
    noAggregation: 'None',
    autosizeThiscolumn: 'Autosize This Column',
    autosizeAllColumns: 'Autosize All Columns',
    groupBy: 'Group by',
    ungroupBy: 'Un-Group by',
    ungroupAll: 'Un-Group All',
    addToValues: 'Add ${variable} to values',
    removeFromValues: 'Remove ${variable} from values',
    addToLabels: 'Add ${variable} to labels',
    removeFromLabels: 'Remove ${variable} from labels',
    resetColumns: 'Reset Columns',
    expandAll: 'Expand All Row Groups',
    collapseAll: 'Close All Row Groups',
    copy: 'Copy',
    ctrlC: 'Ctrl+C',
    ctrlX: 'Ctrl+X',
    copyWithHeaders: 'Copy With Headers',
    copyWithGroupHeaders: 'Copy with Group Headers',
    cut: 'Cut',
    paste: 'Paste',
    ctrlV: 'Ctrl+V',
    export: 'Export',
    csvExport: 'CSV Export',
    excelExport: 'Excel Export',

    // Enterprise Menu Aggregation and Status Bar
    sum: 'Sum',
    first: 'First',
    last: 'Last',
    min: 'Min',
    max: 'Max',
    none: 'None',
    count: 'Count',
    avg: 'Average',
    filteredRows: 'Filtered',
    selectedRows: 'Selected',
    totalRows: 'Total Rows',
    totalAndFilteredRows: 'Rows',
    more: 'More',
    to: 'to',
    of: 'of',
    page: 'Page',
    pageLastRowUnknown: '?',
    nextPage: 'Next Page',
    lastPage: 'Last Page',
    firstPage: 'First Page',
    previousPage: 'Previous Page',

    // Pivoting
    pivotColumnGroupTotals: 'Total',

    // Enterprise Menu (Charts)
    pivotChartAndPivotMode: 'Pivot Chart & Pivot Mode',
    pivotChart: 'Pivot Chart',
    chartRange: 'Chart Range',

    columnChart: 'Column',
    groupedColumn: 'Grouped',
    stackedColumn: 'Stacked',
    normalizedColumn: '100% Stacked',

    barChart: 'Bar',
    groupedBar: 'Grouped',
    stackedBar: 'Stacked',
    normalizedBar: '100% Stacked',

    pieChart: 'Pie',
    pie: 'Pie',
    doughnut: 'Doughnut',

    line: 'Line',

    xyChart: 'X Y (Scatter)',
    scatter: 'Scatter',
    bubble: 'Bubble',

    areaChart: 'Area',
    area: 'Area',
    stackedArea: 'Stacked',
    normalizedArea: '100% Stacked',

    histogramChart: 'Histogram',
    histogramFrequency: 'Frequency',

    combinationChart: 'Combination',
    columnLineCombo: 'Column & Line',
    AreaColumnCombo: 'Area & Column',

    // Charts
    pivotChartTitle: 'Pivot Chart',
    rangeChartTitle: 'Range Chart',
    settings: 'Settings',
    data: 'Data',
    format: 'Format',
    categories: 'Categories',
    defaultCategory: '(None)',
    series: 'Series',
    xyValues: 'X Y Values',
    paired: 'Paired Mode',
    axis: 'Axis',
    navigator: 'Navigator',
    color: 'Color',
    thickness: 'Thickness',
    xType: 'X Type',
    automatic: 'Automatic',
    category: 'Category',
    number: 'Number',
    time: 'Time',
    autoRotate: 'Auto Rotate',
    xRotation: 'X Rotation',
    yRotation: 'Y Rotation',
    ticks: 'Ticks',
    width: 'Width',
    height: 'Height',
    length: 'Length',
    padding: 'Padding',
    spacing: 'Spacing',
    chart: 'Chart',
    title: 'Title',
    titlePlaceholder: 'Chart title - double click to edit',
    background: 'Background',
    font: 'Font',
    top: 'Top',
    right: 'Right',
    bottom: 'Bottom',
    left: 'Left',
    labels: 'Labels',
    size: 'Size',
    minSize: 'Minimum Size',
    maxSize: 'Maximum Size',
    legend: 'Legend',
    position: 'Position',
    markerSize: 'Marker Size',
    markerStroke: 'Marker Stroke',
    markerPadding: 'Marker Padding',
    itemSpacing: 'Item Spacing',
    itemPaddingX: 'Item Padding X',
    itemPaddingY: 'Item Padding Y',
    layoutHorizontalSpacing: 'Horizontal Spacing',
    layoutVerticalSpacing: 'Vertical Spacing',
    strokeWidth: 'Stroke Width',
    lineDash: 'Line Dash',
    offset: 'Offset',
    offsets: 'Offsets',
    tooltips: 'Tooltips',
    callout: 'Callout',
    markers: 'Markers',
    shadow: 'Shadow',
    blur: 'Blur',
    xOffset: 'X Offset',
    yOffset: 'Y Offset',
    lineWidth: 'Line Width',
    normal: 'Normal',
    bold: 'Bold',
    italic: 'Italic',
    boldItalic: 'Bold Italic',
    predefined: 'Predefined',
    fillOpacity: 'Fill Opacity',
    strokeOpacity: 'Line Opacity',
    histogramBinCount: 'Bin count',
    columnGroup: 'Column',
    barGroup: 'Bar',
    pieGroup: 'Pie',
    lineGroup: 'Line',
    scatterGroup: 'X Y (Scatter)',
    areaGroup: 'Area',
    histogramGroup: 'Histogram',
    combinationGroup: 'Combination',
    groupedColumnTooltip: 'Grouped',
    stackedColumnTooltip: 'Stacked',
    normalizedColumnTooltip: '100% Stacked',
    groupedBarTooltip: 'Grouped',
    stackedBarTooltip: 'Stacked',
    normalizedBarTooltip: '100% Stacked',
    pieTooltip: 'Pie',
    doughnutTooltip: 'Doughnut',
    lineTooltip: 'Line',
    groupedAreaTooltip: 'Area',
    stackedAreaTooltip: 'Stacked',
    normalizedAreaTooltip: '100% Stacked',
    scatterTooltip: 'Scatter',
    bubbleTooltip: 'Bubble',
    histogramTooltip: 'Histogram',
    columnLineComboTooltip: 'Column & Line',
    areaColumnComboTooltip: 'Area & Column',
    customComboTooltip: 'Custom Combination',
    noDataToChart: 'No data available to be charted.',
    pivotChartRequiresPivotMode: 'Pivot Chart requires Pivot Mode enabled.',
    chartSettingsToolbarTooltip: 'Menu',
    chartLinkToolbarTooltip: 'Linked to Grid',
    chartUnlinkToolbarTooltip: 'Unlinked from Grid',
    chartDownloadToolbarTooltip: 'Download Chart',
    seriesChartType: 'Series Chart Type',
    seriesType: 'Series Type',
    secondaryAxis: 'Secondary Axis',

    // ARIA
    ariaAdvancedFilterInput: 'Advanced Filter Input',
    ariaChecked: 'checked',
    ariaColumn: 'Column',
    ariaColumnGroup: 'Column Group',
    ariaColumnList: 'Column List',
    ariaColumnSelectAll: 'Toggle Select All Columns',
    ariaDateFilterInput: 'Date Filter Input',
    ariaDefaultListName: 'List',
    ariaFilterColumnsInput: 'Filter Columns Input',
    ariaFilterFromValue: 'Filter from value',
    ariaFilterInput: 'Filter Input',
    ariaFilterList: 'Filter List',
    ariaFilterToValue: 'Filter to value',
    ariaFilterValue: 'Filter Value',
    ariaFilterMenuOpen: 'Open Filter Menu',
    ariaFilteringOperator: 'Filtering Operator',
    ariaHidden: 'hidden',
    ariaIndeterminate: 'indeterminate',
    ariaInputEditor: 'Input Editor',
    ariaMenuColumn: 'Press CTRL ENTER to open column menu.',
    ariaRowDeselect: 'Press SPACE to deselect this row',
    ariaRowSelectAll: 'Press Space to toggle all rows selection',
    ariaRowToggleSelection: 'Press Space to toggle row selection',
    ariaRowSelect: 'Press SPACE to select this row',
    ariaSearch: 'Search',
    ariaSortableColumn: 'Press ENTER to sort',
    ariaToggleVisibility: 'Press SPACE to toggle visibility',
    ariaToggleCellValue: 'Press SPACE to toggle cell value',
    ariaUnchecked: 'unchecked',
    ariaVisible: 'visible',
    ariaSearchFilterValues: 'Search filter values',

    // ARIA Labels for Drop Zones
    ariaRowGroupDropZonePanelLabel: 'Row Groups',
    ariaValuesDropZonePanelLabel: 'Values',
    ariaPivotDropZonePanelLabel: 'Column Labels',
    ariaDropZoneColumnComponentDescription: 'Press DELETE to remove',
    ariaDropZoneColumnValueItemDescription: 'Press ENTER to change the aggregation type',
    ariaDropZoneColumnGroupItemDescription: 'Press ENTER to sort',
    // used for aggregate drop zone, format: {aggregation}{ariaDropZoneColumnComponentAggFuncSeparator}{column name}
    ariaDropZoneColumnComponentAggFuncSeparator: ' of ',
    ariaDropZoneColumnComponentSortAscending: 'ascending',
    ariaDropZoneColumnComponentSortDescending: 'descending',

    // ARIA Labels for Dialogs
    ariaLabelColumnMenu: 'Column Menu',
    ariaLabelCellEditor: 'Cell Editor',
    ariaLabelDialog: 'Dialog',
    ariaLabelSelectField: 'Select Field',
    ariaLabelRichSelectField: 'Rich Select Field',
    ariaLabelTooltip: 'Tooltip',
    ariaLabelContextMenu: 'Context Menu',
    ariaLabelSubMenu: 'SubMenu',
    ariaLabelAggregationFunction: 'Aggregation Function',
    ariaLabelAdvancedFilterAutocomplete: 'Advanced Filter Autocomplete',

    // Number Format (Status Bar, Pagination Panel)
    thousandSeparator: ',',
    decimalSeparator: '.',

    // Data types
    true: 'True',
    false: 'False',
    invalidDate: 'Invalid Date',
    invalidNumber: 'Invalid Number',
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',

}


let zhTW = {

    // 設定篩選器
    selectAll: '（全選）',
    selectAllSearchResults: '（選擇所有搜尋結果）',
    searchOoo: '搜尋...',
    blanks: '（空白）',
    noMatches: '無符合項目',

    // 數字篩選器和文字篩選器
    filterOoo: '篩選...',
    equals: '等於',
    notEqual: '不等於',
    blank: '空白',
    notBlank: '非空白',
    empty: '選擇一項',

    // 數字篩選器
    lessThan: '小於',
    greaterThan: '大於',
    lessThanOrEqual: '小於等於',
    greaterThanOrEqual: '大於等於',
    inRange: '在範圍內',
    inRangeStart: '從',
    inRangeEnd: '到',

    // 文字篩選器
    contains: '包含',
    notContains: '不包含',
    startsWith: '開始於',
    endsWith: '結束於',

    // 日期篩選器
    dateFormatOoo: 'yyyy-mm-dd',

    // 篩選條件
    andCondition: '且',
    orCondition: '或',

    // 篩選按鈕
    applyFilter: '套用',
    resetFilter: '重設',
    clearFilter: '清除',
    cancelFilter: '取消',

    // 篩選標題
    textFilter: '文字篩選',
    numberFilter: '數字篩選',
    dateFilter: '日期篩選',
    setFilter: '設定篩選',

    // 分組欄位篩選
    groupFilterSelect: '選擇欄位：',

    // 進階篩選
    advancedFilterContains: '包含',
    advancedFilterNotContains: '不包含',
    advancedFilterTextEquals: '等於',
    advancedFilterTextNotEqual: '不等於',
    advancedFilterStartsWith: '開始於',
    advancedFilterEndsWith: '結束於',
    advancedFilterBlank: '空白',
    advancedFilterNotBlank: '非空白',
    advancedFilterEquals: '=',
    advancedFilterNotEqual: '!=',
    advancedFilterGreaterThan: '>',
    advancedFilterGreaterThanOrEqual: '>=',
    advancedFilterLessThan: '<',
    advancedFilterLessThanOrEqual: '<=',
    advancedFilterTrue: '為真',
    advancedFilterFalse: '為假',
    advancedFilterAnd: '且',
    advancedFilterOr: '或',
    advancedFilterApply: '套用',
    advancedFilterValidationMissingColumn: '缺少欄位',
    advancedFilterValidationMissingOption: '缺少選項',
    advancedFilterValidationMissingValue: '缺少值',
    advancedFilterValidationInvalidColumn: '找不到該欄位',
    advancedFilterValidationInvalidOption: '找不到該選項',
    advancedFilterValidationMissingQuote: '缺少結尾引號',
    advancedFilterValidationNotANumber: '值不是一個數字',
    advancedFilterValidationMissingCondition: '缺少條件',
    advancedFilterValidationJoinOperatorMismatch: '在一個條件中的連接運算子必須相同',
    advancedFilterValidationInvalidJoinOperator: '找不到連接運算子',
    advancedFilterValidationMissingEndBracket: '缺少結尾括號',
    advancedFilterValidationExtraEndBracket: '結尾括號過多',
    advancedFilterValidationMessage: '運算式有誤。${variable1} - ${variable2}。',
    advancedFilterValidationMessageAtEnd: '運算式有誤。運算式結尾的${variable}。',

    // 側邊欄
    columns: '欄位',
    filters: '篩選器',

    // 欄位工具面板
    pivotMode: '樞紐模式',
    groups: '列分組',
    rowGroupColumnsEmptyMessage: '拖曳至此以設定列分組',
    values: '值',
    valueColumnsEmptyMessage: '拖曳至此以聚合',
    pivots: '欄標籤',
    pivotColumnsEmptyMessage: '拖曳至此以設定欄標籤',

    // 預設的群組欄位標題
    group: '群組',

    // 列拖曳
    rowDragRow: '列',
    rowDragRows: '列',

    // 其他
    loadingOoo: '載入中...',
    loadingError: '錯誤',
    noRowsToShow: '無資料可顯示',
    enabled: '啟用',

    // 選單
    pinColumn: '固定欄位',
    pinLeft: '固定於左',
    pinRight: '固定於右',
    noPin: '取消固定',
    valueAggregation: '值彙總',
    noAggregation: '無',
    autosizeThiscolumn: '自動調整此欄寬',
    autosizeAllColumns: '自動調整所有欄寬',
    groupBy: '分組依據',
    ungroupBy: '取消分組',
    ungroupAll: '取消全部分組',
    addToValues: '新增 ${variable} 至數值',
    removeFromValues: '從數值中移除 ${variable}',
    addToLabels: '新增 ${variable} 至標籤',
    removeFromLabels: '從標籤中移除 ${variable}',
    resetColumns: '重設欄位',
    expandAll: '展開所有資料群組',
    collapseAll: '關閉所有資料群組',
    copy: '複製',
    ctrlC: 'Ctrl+C',
    ctrlX: 'Ctrl+X',
    copyWithHeaders: '複製並包含標題',
    copyWithGroupHeaders: '複製並包含群組標題',
    cut: '剪下',
    paste: '貼上',
    ctrlV: 'Ctrl+V',
    export: '匯出',
    csvExport: 'CSV 匯出',
    excelExport: 'Excel 匯出',

    // 資料分析和狀態列
    sum: '總和',
    first: '第一',
    last: '最後',
    min: '最小',
    max: '最大',
    none: '無',
    count: '計數',
    avg: '平均',
    filteredRows: '篩選的資料',
    selectedRows: '選取的資料',
    totalRows: '總資料筆數',
    totalAndFilteredRows: '資料筆數',
    more: '更多',
    to: '到',
    of: '的',
    page: '頁',
    pageLastRowUnknown: '?',
    nextPage: '下一頁',
    lastPage: '最後一頁',
    firstPage: '第一頁',
    previousPage: '前一頁',

    // 透視
    pivotColumnGroupTotals: '總計',

    // 企業選單（圖表）
    pivotChartAndPivotMode: '樞紐圖表與樞紐模式',
    pivotChart: '樞紐圖表',
    chartRange: '圖表範圍',

    columnChart: '柱狀圖',
    groupedColumn: '分組',
    stackedColumn: '堆疊',
    normalizedColumn: '100% 堆疊',

    barChart: '長條圖',
    groupedBar: '分組',
    stackedBar: '堆疊',
    normalizedBar: '100% 堆疊',

    pieChart: '圓餅圖',
    pie: '圓餅',
    doughnut: '環狀圓餅',

    line: '折線圖',

    xyChart: 'X Y (散佈)',
    scatter: '散佈',
    bubble: '氣泡圖',

    areaChart: '區域圖',
    area: '區域',
    stackedArea: '堆疊',
    normalizedArea: '100% 堆疊',

    histogramChart: '直方圖',
    histogramFrequency: '頻率',

    combinationChart: '混合圖',
    columnLineCombo: '柱狀圖與折線圖',
    AreaColumnCombo: '區域圖與柱狀圖',

    // 圖表
    // ...略

    // ARIA
    // ...略

    // ARIA Drop Zones 的標籤
    // ...略

    // ARIA 對話框的標籤
    // ...略

    // 數字格式（狀態列、分頁面板）
    thousandSeparator: ',',
    decimalSeparator: '.',

    // 資料類型
    true: '是',
    false: '否',
    invalidDate: '無效日期',
    invalidNumber: '無效數字',
    january: '一月',
    february: '二月',
    march: '三月',
    april: '四月',
    may: '五月',
    june: '六月',
    july: '七月',
    august: '八月',
    september: '九月',
    october: '十月',
    november: '十一月',
    december: '十二月',

}


let zhCn = {

    // 设定筛选器
    selectAll: '（全选）',
    selectAllSearchResults: '（选择所有搜寻结果）',
    searchOoo: '搜寻...',
    blanks: '（空白）',
    noMatches: '无符合项目',

    // 数字筛选器和文字筛选器
    filterOoo: '筛选...',
    equals: '等于',
    notEqual: '不等于',
    blank: '空白',
    notBlank: '非空白',
    empty: '选择一项',

    // 数字筛选器
    lessThan: '小于',
    greaterThan: '大于',
    lessThanOrEqual: '小于等于',
    greaterThanOrEqual: '大于等于',
    inRange: '在范围内',
    inRangeStart: '从',
    inRangeEnd: '到',

    // 文字筛选器
    contains: '包含',
    notContains: '不包含',
    startsWith: '开始于',
    endsWith: '结束于',

    // 日期筛选器
    dateFormatOoo: 'yyyy-mm-dd',

    // 筛选条件
    andCondition: '且',
    orCondition: '或',

    // 筛选按钮
    applyFilter: '套用',
    resetFilter: '重设',
    clearFilter: '清除',
    cancelFilter: '取消',

    // 筛选标题
    textFilter: '文字筛选',
    numberFilter: '数字筛选',
    dateFilter: '日期筛选',
    setFilter: '设定筛选',

    // 分组字段筛选
    groupFilterSelect: '选择字段：',

    // 进阶筛选
    advancedFilterContains: '包含',
    advancedFilterNotContains: '不包含',
    advancedFilterTextEquals: '等于',
    advancedFilterTextNotEqual: '不等于',
    advancedFilterStartsWith: '开始于',
    advancedFilterEndsWith: '结束于',
    advancedFilterBlank: '空白',
    advancedFilterNotBlank: '非空白',
    advancedFilterEquals: '=',
    advancedFilterNotEqual: '!=',
    advancedFilterGreaterThan: '>',
    advancedFilterGreaterThanOrEqual: '>=',
    advancedFilterLessThan: '<',
    advancedFilterLessThanOrEqual: '<=',
    advancedFilterTrue: '为真',
    advancedFilterFalse: '为假',
    advancedFilterAnd: '且',
    advancedFilterOr: '或',
    advancedFilterApply: '套用',
    advancedFilterValidationMissingColumn: '缺少字段',
    advancedFilterValidationMissingOption: '缺少选项',
    advancedFilterValidationMissingValue: '缺少值',
    advancedFilterValidationInvalidColumn: '找不到该字段',
    advancedFilterValidationInvalidOption: '找不到该选项',
    advancedFilterValidationMissingQuote: '缺少结尾引号',
    advancedFilterValidationNotANumber: '值不是一个数字',
    advancedFilterValidationMissingCondition: '缺少条件',
    advancedFilterValidationJoinOperatorMismatch: '在一个条件中的连接运算符必须相同',
    advancedFilterValidationInvalidJoinOperator: '找不到连接运算符',
    advancedFilterValidationMissingEndBracket: '缺少结尾括号',
    advancedFilterValidationExtraEndBracket: '结尾括号过多',
    advancedFilterValidationMessage: '表达式有误。${variable1} - ${variable2}。',
    advancedFilterValidationMessageAtEnd: '表达式有误。表达式结尾的${variable}。',

    // 侧边栏
    columns: '字段',
    filters: '筛选器',

    // 字段工具面板
    pivotMode: '枢纽模式',
    groups: '列分组',
    rowGroupColumnsEmptyMessage: '拖曳至此以设定列分组',
    values: '值',
    valueColumnsEmptyMessage: '拖曳至此以聚合',
    pivots: '栏标签',
    pivotColumnsEmptyMessage: '拖曳至此以设定栏标签',

    // 预设的群组字段标题
    group: '群组',

    // 列拖曳
    rowDragRow: '列',
    rowDragRows: '列',

    // 其他
    loadingOoo: '载入中...',
    loadingError: '错误',
    noRowsToShow: '无数据可显示',
    enabled: '启用',

    // 选单
    pinColumn: '固定字段',
    pinLeft: '固定于左',
    pinRight: '固定于右',
    noPin: '取消固定',
    valueAggregation: '值汇总',
    noAggregation: '无',
    autosizeThiscolumn: '自动调整此栏宽',
    autosizeAllColumns: '自动调整所有栏宽',
    groupBy: '分组依据',
    ungroupBy: '取消分组',
    ungroupAll: '取消全部分组',
    addToValues: '新增 ${variable} 至数值',
    removeFromValues: '从数值中移除 ${variable}',
    addToLabels: '新增 ${variable} 至标签',
    removeFromLabels: '从标签中移除 ${variable}',
    resetColumns: '重设字段',
    expandAll: '展开所有数据群组',
    collapseAll: '关闭所有数据群组',
    copy: '复制',
    ctrlC: 'Ctrl+C',
    ctrlX: 'Ctrl+X',
    copyWithHeaders: '复制并包含标题',
    copyWithGroupHeaders: '复制并包含群组标题',
    cut: '剪下',
    paste: '贴上',
    ctrlV: 'Ctrl+V',
    export: '汇出',
    csvExport: 'CSV 汇出',
    excelExport: 'Excel 汇出',

    // 资料分析和状态栏
    sum: '总和',
    first: '第一',
    last: '最后',
    min: '最小',
    max: '最大',
    none: '无',
    count: '计数',
    avg: '平均',
    filteredRows: '筛选的资料',
    selectedRows: '选取的数据',
    totalRows: '总资料笔数',
    totalAndFilteredRows: '资料笔数',
    more: '更多',
    to: '到',
    of: '的',
    page: '页',
    pageLastRowUnknown: '?',
    nextPage: '下一页',
    lastPage: '最后一页',
    firstPage: '第一页',
    previousPage: '前一页',

    // 透视
    pivotColumnGroupTotals: '总计',

    // 企业选单（图表）
    pivotChartAndPivotMode: '枢纽图表与枢纽模式',
    pivotChart: '枢纽图表',
    chartRange: '图表范围',

    columnChart: '柱状图',
    groupedColumn: '分组',
    stackedColumn: '堆栈',
    normalizedColumn: '100% 堆栈',

    barChart: '直方图',
    groupedBar: '分组',
    stackedBar: '堆栈',
    normalizedBar: '100% 堆栈',

    pieChart: '圆饼图',
    pie: '圆饼',
    doughnut: '环状圆饼',

    line: '折线图',

    xyChart: 'X Y (散布)',
    scatter: '散布',
    bubble: '气泡图',

    areaChart: '分区图',
    area: '区域',
    stackedArea: '堆栈',
    normalizedArea: '100% 堆栈',

    histogramChart: '直方图',
    histogramFrequency: '频率',

    combinationChart: '混合图',
    columnLineCombo: '柱状图与折线图',
    AreaColumnCombo: '分区图与柱状图',

    // 图表
    // ...略

    // ARIA
    // ...略

    // ARIA Drop Zones 的标签
    // ...略

    // ARIA 对话框的标签
    // ...略

    // 数字格式（状态栏、分页面板）
    thousandSeparator: ',',
    decimalSeparator: '.',

    // 数据类型
    true: '是',
    false: '否',
    invalidDate: '无效日期',
    invalidNumber: '无效数字',
    january: '一月',
    february: '二月',
    march: '三月',
    april: '四月',
    may: '五月',
    june: '六月',
    july: '七月',
    august: '八月',
    september: '九月',
    october: '十月',
    november: '十一月',
    december: '十二月',

}


let kp = {
    en,
    'zh-tw': zhTW,
    'zh-cn': zhCn,
}


/**
 * 基於指定語系取得指定鍵值
 *
 * @param {String} lang 輸入語系字串
 * @param {String} key 輸入指定鍵字串
 * @param {String} [def=''] 輸入若無法取得時之預設值字串，預設為''
 * @returns {String} 回傳值字串
 */
function getLangText(lang, key, def = '') {
    lang = lang.toLowerCase()
    let r = get(kp, `${lang}.${key}`, def)
    return r
}


export default getLangText
