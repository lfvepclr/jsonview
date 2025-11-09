# jsonview

Nested JSON Viewer

## Downloads

<a href="https://chromewebstore.google.com/detail/nested-json-viewer/aebhckhcgijcdfidnpfadpidllkcdjdg">
  <img src="https://user-images.githubusercontent.com/22908993/166417152-f870bfbd-1770-4c28-b69d-a7303aebc9a6.png" alt="Chrome web store">
</a>

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/aebhckhcgijcdfidnpfadpidllkcdjdg.svg)](https://chromewebstore.google.com/detail/nested-json-viewer/aebhckhcgijcdfidnpfadpidllkcdjdg)

## About

Demo json
```json
{
  "simple_str": "这是一个简单字符串类型",
  "json_demo": "{\"status\": \"success\", \"data\": {\"id\": 12345, \"name\": \"测试用户\", \"tags\": [\"json\", \"string\", \"test\"], \"config\": {\"enabled\": true, \"timeout\": 30}}, \"message\": \"操作完成\", \"xml_value\": \"<?xml version=\\\"1.0\\\" encoding=\\\"UTF-8\\\"?><root><user id=\\\"1001\\\"><name>张三</name><email>zhangsan@example.com</email><roles><role admin=\\\"true\\\">管理员</role><role>编辑者</role></roles><metadata><![CDATA[特殊字符 <>&\\\"' 测试]]></metadata></user></root>\"}",
  "xml_demo": "<?xml version=\"1.0\" encoding=\"UTF-8\"?><root><user id=\"1001\"><name>张三</name><email>zhangsan@example.com</email><roles><role admin=\"true\">管理员</role><role>编辑者</role></roles><metadata><![CDATA[特殊字符 <>&\"' 测试]]></metadata><json_data><![CDATA[{\"status\": \"success\", \"data\": {\"id\": 12345, \"name\": \"测试用户\", \"tags\": [\"json\", \"string\", \"test\"], \"config\": {\"enabled\": true, \"timeout\": 30}}, \"message\": \"操作完成\"}]]></json_data></user></root>",
  "edge_cases": {
    "special_chars": "包含引号\"和反斜杠\\以及换行\n和制表\t符",
    "unicode": "Unicode测试：你好世界 🚀 émojis ñ 中文",
    "empty_string": "",
    "multiline_text": "第一行文本\n第二行文本\n  第三行带缩进\n最后一行"
  },
  "zebra": "最后一个字段",
  "apple": "第一个字段",
  "mango": "中间字段",
  "banana": "第二个字段"
}
```

1. show json str value in json view
![alt jsonview](img/1280_800%20(1).png)
2. show img in  json str value url in json view
![alt jsonview](img/p2%20(1).png)
