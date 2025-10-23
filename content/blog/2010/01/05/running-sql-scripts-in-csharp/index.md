---
title: Running SQL scripts in C#
date: 2010-01-05T08:01:44-06:00
tags: [csharp,dotnet,sql]
toc: true
series: []
summary: How to run a bunch of SQL scripts inside a C# program.
mermaid: false
mathjax: false
draft: false
---

## A simple problem

I needed to run a directory full of SQL scripts in a SQL Server instance.
Here's a bit of code that:

1. Reads in any script called `*.sql` from a directory that does not have the word 'test' somewhere in it
1. Uses the `Microsoft.SqlServer.Management.Common` and `Microsoft.SqlServer.Management.Smo`
1. Executes each script in turn using name-based sorting for the order of execution.

## Get it done!

```csharp
public bool RestoreFieldDatabaseFromBackup(string connectionString)
{
 List scripts = this._sqlDirectory.GetFiles("*.sql", SearchOption.AllDirectories)
  .Where(s => !s.Name.Contains("test"))
  .Select(s => s.FullName).ToList();

 if (scripts.Count() == 0) return false;

 var connection = new SqlConnection(connectionString);

 try
 {
  for (int i = 0; i < scripts.Count; i++)
  {
   using (var reader = new StreamReader(scripts[i]))
   {
    var server = new Server(new ServerConnection(connection));
    var db = new Database(server, connection.Database);
    string scriptText = reader.ReadToEnd();
    Log.For(this).Debug("Running: " + scripts[i]);
    db.ExecuteNonQuery(scriptText);
   }
  }
 }
 catch (Exception ex)
 {
  Log.For(this).Error(ex);
  return false;
 }
 return true;
}
```