import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const KMDB_API_KEY = process.env.NEXT_PUBLIC_KMDB_API_KEY;
        const KMDB_BASE_URL = "http://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp";

        console.log(`[KMDB Test] API 키: ${KMDB_API_KEY}`);

        // 간단한 테스트 쿼리
        const query = "아바타";

        // 직접 API 호출
        const params = new URLSearchParams({
            collection: 'kmdb_new2',
            detail: 'Y',
            title: query,
            ServiceKey: KMDB_API_KEY || '',
            listCount: '10'
        });

        const url = `${KMDB_BASE_URL}?${params.toString()}`;
        console.log(`[KMDB Test] 요청 URL: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        console.log(`[KMDB Test] 응답 상태: ${response.status} ${response.statusText}`);

        const responseText = await response.text();
        console.log(`[KMDB Test] 응답 텍스트 (처음 200자): ${responseText.substring(0, 200)}...`);

        // 응답 구조 확인
        let data;
        try {
            data = JSON.parse(responseText);
            console.log(`[KMDB Test] 응답 구조:`, Object.keys(data));

            if (data.Data) {
                console.log(`[KMDB Test] Data 구조:`, Object.keys(data.Data));

                if (Array.isArray(data.Data)) {
                    console.log(`[KMDB Test] Data는 배열입니다. 길이: ${data.Data.length}`);

                    if (data.Data.length > 0 && data.Data[0].Result) {
                        console.log(`[KMDB Test] 검색 결과 수: ${data.Data[0].Result.length}`);
                    }
                }
            }
        } catch (e) {
            console.error(`[KMDB Test] JSON 파싱 오류:`, e);
            return NextResponse.json({ error: "API 응답을 JSON으로 파싱할 수 없습니다." }, { status: 500 });
        }

        return NextResponse.json({
            status: response.status,
            statusText: response.statusText,
            data: data
        });
    } catch (error) {
        console.error("KMDB API 테스트 실패:", error);
        return NextResponse.json(
            { error: "KMDB API 테스트 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
} 