import urllib
import re
import tornado.ioloop
import tornado.web
from pydub import AudioSegment
import speech_recognition as sr
import difflib
audio_path="/home/alienware/audio/"

class AudioToText(tornado.web.RequestHandler):
    def get(self):
        self.write("Hello World AudioToText")
    def post(self):
        print('-post trigger-')
        query=urllib.parse.unquote(self.request.query)
        parameterArr=query.split('=');
        for field_name, files in self.request.files.items():
            for info in files:
                body = info["body"]
                try:
                    with open(audio_path+"test.mp3", 'wb') as f:
                            f.write(body)
                    sound = AudioSegment.from_mp3(audio_path+"test.mp3")
                    sound.export(audio_path+"test.wav", format="wav")
                    r = sr.Recognizer()
                    with sr.AudioFile(audio_path+"test.wav") as source:
                        audio = r.record(source)  # read the entire audio file
                        res=r.recognize_google(audio)
                except:
                    self.write("Network error,try again seconds later|0.00")
                else:
                    originStr = re.sub(r'[^\w\s]','',parameterArr[1])
                    print(originStr)
                    ratioRes = difflib.SequenceMatcher(None, originStr.lower(), res).ratio()
                    print(ratioRes)
                    self.write(res+"|"+str(round(ratioRes*10,2)))



class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Hello World AudioConvert")
    def post(self):
        print('-post trigger-')
        try:
            for field_name, files in self.request.files.items():
                for info in files:
                    body = info["body"]
                    with open(audio_path+"test.mp3", 'wb') as f:
                            f.write(body)
                    sound = AudioSegment.from_mp3(audio_path+"test.mp3")
                    sound.export(audio_path+"test.wav", format="wav")
                    r = sr.Recognizer()
                    with sr.AudioFile(audio_path+"test.wav") as source:
                        audio = r.record(source)  # read the entire audio file
                        res=r.recognize_google(audio)
            self.write(res)
        except:
            self.write(" |Something goes wrong.")

application = tornado.web.Application([(r"/audioToText", AudioToText),(r"/upload/fileUpload", MainHandler) ])

if __name__ == "__main__":
    application.listen(8091)
    tornado.ioloop.IOLoop.instance().start()
