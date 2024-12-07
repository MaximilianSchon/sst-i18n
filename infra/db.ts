new sst.aws.Dynamo("Database", {
    fields: {
        pk: "string", // probably lang
        sk: "string" // probably key
    },
    primaryIndex: { hashKey: "pk", rangeKey: "sk" }
})