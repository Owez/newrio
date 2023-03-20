# Sessions

Core session interfaces and functions for shared use

## Example

```ts
import { newSession } from "sessions"

// Create a new session from token
const token = "ua:efwfweewfwefewewf"
const session = createSession(token)

// Will say it's for an account
console.log(session.token?.intent)
```
