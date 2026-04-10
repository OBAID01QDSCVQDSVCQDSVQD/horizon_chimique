
# branding_updater.rb
puts "Starting Branding Update to SDK Batiment..."
Dir.glob("**/*.{json,yml,js,html}").each do |file|
  next if File.directory?(file)
  begin
    content = File.read(file)
    if content.include?("Propulsé par Chatwoot")
      puts "Updating: #{file}"
      File.write(file, content.gsub("Propulsé par Chatwoot", "Propulsé par SDK Batiment"))
    end
    if content.include?("Powered by Chatwoot")
      puts "Updating: #{file}"
      File.write(file, content.gsub("Powered by Chatwoot", "Propulsé par SDK Batiment"))
    end
  rescue => e
    # skip binary files or permission issues
  end
end
puts "Branding Updated Successfully!"
