from fastapi import Request

SUPPORTED = {"es", "en", "fr"}
DEFAULT = "es"

def resolve_locale(request: Request) -> str:
    # 1) Query param ?lang=
    qp = request.query_params.get("lang")
    if qp and qp in SUPPORTED:
        return qp

    # 2) Header X-Locale
    header = request.headers.get("X-Locale")
    if header and header in SUPPORTED:
        return header

    # 3) Accept-Language header
    al = request.headers.get("Accept-Language", "")
    for cand in al.split(","):
        code = cand.strip().split(";")[0][:2]
        if code in SUPPORTED:
            return code

    # 4) Default
    return DEFAULT
