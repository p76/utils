import { marked } from 'marked';
// B区表格列默认列
const fixedItem: any = {
  数据来源: 'dataIdfName',
  审核状态: 'auditName',
  审核人: 'auditorName',
  审核时间: 'auditTime',
  更新人: 'modifierName',
  更新时间: 'modifyTime',
  描述: 'desc',
};

// 新增项映射
const getDom = (type: string, params?: any) => {
  const { range, defaultVal, name, tipVal } = params;
  if (type.includes('投资组合')) {
    return `<FastPortCodeSelectPro
            onlyPort
            funCode={model.funCode}
            groupSelectType="radio"
            portSelectType="radio"
            />`;
  } else if (type.includes('多选')) {
    return `<QuarkSelect
            showSearch
            loadData={}
            levelData={['data', 'content']}
            options={model.mktData}
            optionValue="value"
            optionLabel="label"
            treeMode
            radioSrting
            showCheckbox
            disabledRow={(row: any) => !row.leafs}
            />`;
  } else if (type.includes('单选')) {
    return `<QuarkSelect
            showSearch
            loadData={}
            levelData={['data', 'content']}
            options={model.mktData}
            optionValue="value"
            optionLabel="label"
            treeMode
            radioSrting
            disabledRow={(row: any) => !row.leafs}
            />`;
  } else if (type.includes('日期')) {
    const reg = /[1-9][0-9]*/g;
    const initialValue = defaultVal?.match(reg);
    return initialValue ? `<QuarkAMSTime initialValue={'${initialValue?.join('-')}'}/>` : `<QuarkAMSTime />`;
  } else if (type.includes('文本') && !type.includes('数值')) {
    const rangeArr = range?.match(/\d+(.\d+)?/g);
    if (name === '描述') {
      return `<QuarkInput.TextArea maxLength={${rangeArr?.[0]}} />`;
    }
    return `<QuarkInput maxLength={${rangeArr?.[0]}} />`;
  } else {
    const rangeArr = range?.match(/\d+(.\d+)?/g);
    const config: any = {};
    if (rangeArr?.length > 0) {
      config.integerNumber = rangeArr?.[0];
      config.floatNumber = rangeArr?.[1];
    }
    if (type.includes('按钮') || type.includes('icon')) {
      if (tipVal) {
        return `<QuarkAmount
                cursorPosition="right"
                placeholder="${tipVal}"
                integerNumber={${rangeArr?.[0]}}
                floatNumber={${rangeArr?.[1]}}
                addonAfter={
                  <Tooltip title="重新计算">
                    <QuarkIcon
                      type="calculator"
                      onClick={calcEvent}
                    />
                  </Tooltip>
                }
              />`;
      }
      return `<QuarkAmount
              cursorPosition="right"
              integerNumber={${rangeArr?.[0]}}
              floatNumber={${rangeArr?.[1]}}
              addonAfter={
                <Tooltip title="重新计算">
                  <QuarkIcon
                    type="calculator"
                    onClick={calcEvent}
                  />
                </Tooltip>
              }
            />`;
    }
    if (tipVal) {
      return `<QuarkAmount
              placeholder="${tipVal}"
              cursorPosition="right"
              integerNumber={${rangeArr?.[0]}}
              floatNumber={${rangeArr?.[1]}}
              />`;
    }
    return `<QuarkAmount
            cursorPosition="right"
            integerNumber={${rangeArr?.[0]}}
            floatNumber={${rangeArr?.[1]}}
            />`;
  }
};

export const marked2View = (markedContent: any = '') => {
  const configInfo: any = {};
  // md数据转table
  const html = marked(markedContent);
  // 截取需要进行转换的数据
  const tableList = html.match(/<table>([\s\S]*?)<\/table>/g);
  // 生成tableDOM
  const tableDOM = tableList?.map((tableStr: string) => {
    return document.createRange().createContextualFragment(tableStr).firstChild;
  });

  // 搜索栏默认值
  const searchInitialValues = { audit: null };

  const getSearchType = (type: string) => {
    // 搜索列映射
    if (type.includes('选')) {
      return 'quarkSelect';
    } else if (type.includes('日期')) {
      return 'quarkAMSTime';
    } else {
      return 'quarkInput';
    }
  };

  // 获取表格列配置
  const getFormColumns = (itemList: any[]) => {
    return itemList?.map((item: any) => {
      const itemParams: any = {
        dataIndex: item?.dataindex || fixedItem[item['列名']] || item['列名'],
        title: item['列名'],
      };
      if (item?.['对齐']?.includes('右')) {
        itemParams.align = 'right';
        itemParams.getValue = `(row: any) => formatStringMunber({ str: row?.dataIndex })`;
      }
      return itemParams;
    });
  };

  // 获取搜索列配置
  const getSearchColumns = (itemList: any[]) => {
    itemList.shift();
    return itemList?.map((item: any) => {
      const itemParams: any = {
        dataIndex: item?.dataindex || item?.['名称'],
        title: item?.['名称'],
        valueType: getSearchType(item?.['控件类型']),
        fieldProps: {},
      };
      if (itemParams.valueType === 'quarkSelect') {
        itemParams.fieldProps = {
          optionValue: '',
          optionLabel: '',
          levelData: ['data', 'content'],
          loadData: '',
          showSearch: true,
          dropdownMatchSelectWidth: 200,
          tableProps: { columns: {} },
        };
      }
      if (item?.['默认值'] === '0.00') {
        itemParams.fieldProps.placeholder = '0.00';
      }
      if (item?.['可输入范围']) {
        // 获取数字
        const limitArr = item?.['可输入范围']?.match(/\d+(.\d+)?/g);
        if (item?.['是否必输'] === '是') {
          itemParams.fieldProps.allowClear = false;
        }
        if (limitArr?.length === 1) {
          itemParams.fieldProps.maxLength = limitArr[0];
        }
        if (limitArr?.length === 2) {
          itemParams.fieldProps.integerNumber = limitArr[0];
          itemParams.fieldProps.floatNumber = limitArr[1];
        }
      }
      return itemParams;
    });
  };

  // 获取新增弹窗输入框
  const getAddInputs = (itemList: any[]) => {
    let dom = '';
    itemList?.forEach((item: any) => {
      let rules: any = '';
      if (item?.['是否必输'] === '是') {
        const message = item['控件类型'].includes('选') ? '请选择' : '请输入';
        const rangeArr = item['可输入范围']?.match(/\d+(.\d+)?/g);
        const pattern = `pattern:/^\d{0,${rangeArr?.[0]}}\.*\d{0,${rangeArr?.[1]}$/}`;
        if (item['可输入范围'].includes('非负数')) {
          rules = `rules={[{ ${pattern} , required: true, message: '${message + item?.['名称']}' }]}`;
        } else {
          rules = `rules={[{ required: true, message: '${message + item?.['名称']}' }]}`;
        }
      }
      dom += rules ? (
        `<Col span={12}>
        <Form.Item
          label='${item?.['名称']}'
          name=''
          ${rules}
        >
         ${getDom(item['控件类型'], { name: item?.['名称'], range: item['可输入范围'], defaultVal: item['默认值'], tipVal: item['是否有提示文本'] })}
        </Form.Item>
      </Col>
      `
      ) : (
        `<Col span={12}>
        <Form.Item
          label='${item?.['名称']}'
          name=''
        >
         ${getDom(item['控件类型'], { name: item?.['名称'], range: item['可输入范围'], defaultVal: item['默认值'], tipVal: item['是否有提示文本'] })}
        </Form.Item>
      </Col>
      `
      );
    });
    return dom;
  };

  // table转JsonList
  function tableToJson(table: any) {
    const data: any = [];
    const headers = [];
    const tableCells = table?.rows?.[0]?.cells;
    for (let i = 0; i < tableCells?.length; i++) {
      headers[i] = tableCells[i].innerHTML.toLowerCase().replace(/ /gi, '');
    }
    for (let i = 1; i < table?.rows?.length; i++) {
      const tableRow = table?.rows?.[i].cells;
      const rowData: any = {};
      for (let j = 0; j < tableRow.length; j++) {
        rowData[headers[j]] = tableRow[j].innerHTML;
      }
      data.push(rowData);
    }
    return data;
  }
  // JsonList
  const initialDataMap = tableDOM?.map((table: any) => tableToJson(table));

  initialDataMap?.forEach((itemList: any) => {
    if (itemList?.[0]?.['列名']) {
      // 表格列配置
      configInfo.columns = getFormColumns(itemList);
    } else if (itemList?.[0]?.['名称'] && itemList?.[0]?.['字段分组']) {
      // 新增项配置
      configInfo.add = getAddInputs(itemList);
    } else if (itemList?.[0]?.['名称']) {
      // 搜索列配置
      configInfo.serach = getSearchColumns(itemList);
    }
  });
  return { searchInitialValues, ...configInfo } || [];
};
