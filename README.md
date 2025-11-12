# NestedJonsViewer

内嵌 JSON 和 XML ，自动展开。

【解决开发者的小事】
JSON中嵌入了 XML 或者 JSON 在开发者中很常见。 这个插件可以解析嵌套的JSON字段串，并显示为树形结构。解决嵌套JSON字段串 copy 再 paste 重新格式化的问题。


## Downloads

<a href="https://chromewebstore.google.com/detail/nested-json-viewer/aebhckhcgijcdfidnpfadpidllkcdjdg">
  <img src="https://user-images.githubusercontent.com/22908993/166417152-f870bfbd-1770-4c28-b69d-a7303aebc9a6.png" alt="Chrome web store">
</a>

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/aebhckhcgijcdfidnpfadpidllkcdjdg.svg)](https://chromewebstore.google.com/detail/nested-json-viewer/aebhckhcgijcdfidnpfadpidllkcdjdg)

## About

### 测试字段串：

1. 简单JSON字段串：包含value有json字段串

```json
{
    "method": "post",
    "body": "{\"params\":{\"logistics_interface\":\"{\\\"traceId\\\":\\\"fadfa\\\",\\\"headers\\\":\\\"{\\\\\\\"tenant_id\\\\\\\":\\\\\\\"PXX\\\\\\\",\\\\\\\"Content-Type\\\\\\\":\\\\\\\"application/json\\\\\\\"}\\\",\\\"method\\\":\\\"HTTP_POST\\\",\\\"url\\\":\\\"https://baidu/outbound/getlist\\\",\\\"content\\\":\\\"{\\\\\\\"method\\\\\\\":\\\\\\\"outbound.getlist\\\\\\\",\\\\\\\"appKey\\\\\\\":\\\\\\\"7c693cefdfa1-fadfafaf-954ab805aedb\\\\\\\",\\\\\\\"body\\\\\\\":\\\\\\\"{\\\\\\\\\\\\\\\"consignment_no\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"XCN141530fdaf11090125\\\\\\\\\\\\\\\"}\\\\\\\",\\\\\\\"fpxUser\\\\\\\":\\\\\\\"{\\\\\\\\\\\\\\\"cityCode\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"长期区\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"remark\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"cityId\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"4155\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"source\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"8\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"tenantCode\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"XPX\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"marketfollow\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"0\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"countryId\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"460\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"customCode\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"FSDFDA\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"openedBrandCodes\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"[\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"FB4\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"]\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"organizationId\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"countryCode\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"中国香港\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"imageUrl\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"nickname\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"id\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"413123123\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"locked\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"false\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"markCodesStr\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"{\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"fb4MarkCode\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"XPX312312\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"}\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"recommender\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"email\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"testqq@qq.com\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"stat\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"1\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"salt\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"provinceCode\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"九龙\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"customerProfile\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"1\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"mobile\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"312312\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"parentUserId\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"userName\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"999999\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"userId\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"3123123123123\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"provinceId\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"3746\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"markCode\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"childAccountType\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"roleIds\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"childAccountIsEnable\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"salesman\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"XPX312\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"userType\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"0\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"pushed\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"true\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"childAccountBusCode\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\"}\\\\\\\",\\\\\\\"fpxUserId\\\\\\\":\\\\\\\"fadfaffdafadff-rqewreqwrq\\\\\\\",\\\\\\\"format\\\\\\\":\\\\\\\"json\\\\\\\",\\\\\\\"timestamp\\\\\\\":\\\\\\\"43141324\\\\\\\",\\\\\\\"language\\\\\\\":\\\\\\\"cn\\\\\\\"}\\\"}\",\"data_digest\":\"BvRjkbJzwOoWI3ei+fdasfaf==\",\"partner_code\":\"XPXX\",\"from_code\":\"XPX_INNER\",\"msg_type\":\"XPXXP_INTER\",\"msg_id\":\"431241243241412\"},\"type\":\"KV\"}"
}
```
显示结果
![alt jsonview](img/json_json.png)
2. 示例字段串：json包含XML字符串、图片、json字段串

```json
{
  "simple_str": "这是一个简单字符串类型",
  "json_demo": "{\"status\": \"success\", \"data\": {\"id\": 12345, \"name\": \"测试用户\", \"tags\": [\"json\", \"string\", \"test\"], \"config\": {\"enabled\": true, \"timeout\": 30}}, \"message\": \"操作完成\", \"xml_value\": \"<?xml version=\\\"1.0\\\" encoding=\\\"UTF-8\\\"?><root><user id=\\\"1001\\\"><name>张三</name><email>zhangsan@example.com</email><roles><role admin=\\\"true\\\">管理员</role><role>编辑者</role></roles><metadata><![CDATA[特殊字符 <>&\\\"' 测试]]></metadata><json_data><![CDATA[{\"status\": \"success\", \"data\": {\"id\": 12345, \"name\": \"测试用户\", \"tags\": [\"json\", \"string\", \"test\"], \"config\": {\"enabled\": true, \"timeout\": 30}}, \"message\": \"操作完成\"}]]></json_data><simpleJson>{&quot;b&quot;:[1,2,3],&quot;a&quot;:[1,2,3]}</simpleJson></user></root>\"}",
  "xml_demo": "<?xml version=\"1.0\" encoding=\"UTF-8\"?><root><user id=\"1001\"><name>张三</name><email>zhangsan@example.com</email><roles><role admin=\"true\">管理员</role><role>编辑者</role></roles><metadata><![CDATA[特殊字符 <>&\"' 测试]]></metadata><json_data><![CDATA[{\"status\": \"success\", \"data\": {\"id\": 12345, \"name\": \"测试用户\", \"tags\": [\"json\", \"string\", \"test\"], \"config\": {\"enabled\": true, \"timeout\": 30}}, \"message\": \"操作完成\"}]]></json_data><simpleJson>{&quot;b&quot;:[1,2,3],&quot;a&quot;:[1,2,3]}</simpleJson></user></root>",
  "edge_cases": {
    "special_chars": "包含引号\"和反斜杠\\以及换行\n和制表\t符",
    "unicode": "Unicode测试：你好世界 🚀 émojis ñ 中文",
    "empty_string": "",
    "multiline_text": "第一行文本\n第二行文本\n  第三行带缩进\n最后一行"
  },
  "zebra": "最后一个字段",
  "apple": "第一个字段",
  "mango": "中间字段",
  "banana": "第二个字段",
  "img_url": "https://raw.githubusercontent.com/yangxiaoge/jsonview/main/img/p1.png",
  "baidu_url": "https://www.baidu.com"
}
```
显示结果
![alt jsonview](img/json_xml.png)

3. 示例字段串：xml，包含JSON

```xml
<request>
    <method>HTTP_POST</method>
    <url>https://baidu.com/outbound/getlist</url>
    <traceId>traceIdfdafadfad</traceId>
    <headers>{"tenant_id":"BAIDU","Content-Type":"application/json","Accept-Encoding":"gzip, deflate, br", "Accept-Language":"zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7", "Connection":"keep-alive", "Content-Length":"0", "Host":"baidu.com", "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x"}</headers>
    <content>{"method":"outbound.getlist","appKey":"7c6fdface1-954fdafdb","body":"{\"consignment_no\":\"XC14154324234511090125\"}","fpxUser":"{\"cityCode\":\"长江区\",\"remark\":\"\",\"cityId\":\"123\",\"source\":\"8\",\"tenantCode\":\"XPX\",\"marketfollow\":\"0\",\"countryId\":\"460\",\"customCode\":\"fadfa\",\"openedBrandCodes\":\"[\\\"XPX\\\"]\",\"organizationId\":\"\",\"countryCode\":\"上海\",\"imageUrl\":\"\",\"nickname\":\"\",\"id\":\"fadfa\",\"locked\":\"false\",\"markCodesStr\":\"{\\\"fb4MarkCode\\\":\\\"X12312\\\"}\",\"recommender\":\"\",\"email\":\"demo_test@qq.com\",\"stat\":\"1\",\"salt\":\"\",\"provinceCode\":\"上海\",\"customerProfile\":\"1\",\"mobile\":\"123123123\",\"parentUserId\":\"\",\"userName\":\"3213123\",\"userId\":\"3123123\",\"provinceId\":\"3746\",\"markCode\":\"\",\"childAccountType\":\"\",\"roleIds\":\"\",\"childAccountIsEnable\":\"\",\"salesman\":\"XN42141\",\"userType\":\"0\",\"pushed\":\"true\",\"childAccountBusCode\":\"\"}","fpxUserId":"fdafdafafa","format":"json","timestamp":"fadsfaf","language":"cn"}</content>
</request>
```
显示结果
![alt jsonview](img/xml_json.png)

