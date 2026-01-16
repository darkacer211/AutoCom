from groq import Groq
import inspect

g = Groq(api_key='x')
f = g.chat.completions.create
print('callable:', callable(f))
print('doc snippet:', (f.__doc__ or '')[:400])
try:
    print('signature:', inspect.signature(f))
except Exception as e:
    print('inspect failed:', e)

# print repr of function for hints
print('repr:', repr(f))
